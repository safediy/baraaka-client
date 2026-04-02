import { ref } from 'vue'

interface GeolocationOptions {
  onSuccess: (coords: { lat: number; lng: number }) => void
  onDenied?: () => void
  fallback?: () => void
}

export function useGeolocation(options: GeolocationOptions) {
  const loading = ref(false)

  const getCurrentPosition = () => {
    loading.value = true

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        loading.value = false
        options.onSuccess({
          lat: coords.latitude,
          lng: coords.longitude
        })
      },
      (error) => {
        loading.value = false

        if (error.code === error.PERMISSION_DENIED) {
          options.onDenied?.()
        }

        options.fallback?.()
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const handleLocation = async () => {
    if (!navigator?.geolocation) {
      options.fallback?.()
      return
    }

    try {
      const permission = await navigator.permissions.query({
        name: 'geolocation' as PermissionName
      })

      if (permission.state === 'granted' || permission.state === 'prompt') {
        getCurrentPosition()
      } else {
        options.onDenied?.()
        options.fallback?.()
      }
    } catch {
      getCurrentPosition()
    }
  }

  return { handleLocation, loading }
}
