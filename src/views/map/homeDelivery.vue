<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ref, onMounted, watch } from 'vue'
import { GoogleMap } from 'vue3-google-map'
import { MapPredictionDTO } from 'types/api'
import personPvzService from '@/api/PersonPvz'
import { DrawerProps, ElMessage } from 'element-plus'
import { tashkentDefaultLocation } from '@/constants/api'
import { getSessianStorage, removeSessianStorage } from '@/utils/cache/cookies'
import DynamicDialog from '@/components/DynamicDialog/DynamicDialog.vue'

import plusSvg from '@/views/map/images/plus.svg?url'
import warnSvg from '@/views/map/images/warn.svg?url'
import minusSvg from '@/views/map/images/minus.svg?url'
import locationSvg from '@/views/map/images/location.svg?url'
import LocationLoading from '@/assets/profile/locationLoading.gif'
import { tashkentBoundary } from '@/constants/tashkentBoundary'
import { ENV } from '@/config/env'

defineOptions({
  name: 'MapScreen'
})

const { t } = useI18n()
const router = useRouter()
const telegramService = window.Telegram
telegramService.WebApp.ready()
const MAP_KEY = ENV.GOOGLE_API_KEY

const zoom = ref<number>(12)
const state1 = ref('')
const mapRef = ref(null)
const yPosition = ref(35)
const warn = ref<boolean>(false)
const centerValue = ref<any>(null)
const loading = ref<boolean>(false)
const warnDraw = ref<boolean>(false)
const mapLoading = ref<boolean>(false)
const confirmDialog = ref<boolean>(false)
const autocompleteService = ref<any>(null)
const polygonOverlay = ref<any | null>(null)
const direction = ref<DrawerProps['direction']>('btt')
const centerMarker = ref<{ lat: number; lng: number }>(tashkentDefaultLocation)

const createPolygon = (map: google.maps.Map) => {
  if (polygonOverlay.value) {
    polygonOverlay.value.setMap(null)
  }

  polygonOverlay.value = new (window as any).google.maps.Polygon({
    paths: tashkentBoundary,
    strokeColor: '#FF0066',
    strokeOpacity: 1,
    strokeWeight: 2,
    fillColor: '#044CA2',
    fillOpacity: 0.05,
    clickable: false,
    draggable: false,
    editable: false,
    geodesic: false,
    zIndex: 1
  })
  polygonOverlay.value.setMap(map)
}

const onMapReady = () => {
  const map = (mapRef.value as any)?.map
  if (map) {
    createPolygon(map)
  }
}

const isPointInPolygon = (lat: number, lng: number, polygon: Array<{ lat: number; lng: number }>) => {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat
    const yi = polygon[i].lng
    const xj = polygon[j].lat
    const yj = polygon[j].lng

    const intersect = yi > lng !== yj > lng && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

const fetchCurrentLocation = async () => {
  if (!navigator?.geolocation) {
    console.warn('Geolocation is not supported by this browser.')
    centerMarker.value = tashkentDefaultLocation
    return
  }

  if (navigator.permissions) {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName })

      if (permissionStatus.state === 'granted') {
        getCurrentPosition()
      } else if (permissionStatus.state === 'prompt') {
        getCurrentPosition()
      } else if (permissionStatus.state === 'denied') {
        console.warn('Geolocation permission has been denied.')
        centerMarker.value = tashkentDefaultLocation
      }

      permissionStatus.addEventListener('change', () => {
        if (permissionStatus.state === 'granted') {
          getCurrentPosition()
        } else if (permissionStatus.state === 'denied') {
          centerMarker.value = tashkentDefaultLocation
        }
      })
    } catch (error) {
      console.warn('Permissions API error, trying direct geolocation:', error)
      getCurrentPosition()
    }
  } else {
    getCurrentPosition()
  }
}

const getCurrentPosition = () => {
  navigator.geolocation.getCurrentPosition(
    ({ coords: { latitude, longitude } }) => {
      centerMarker.value = { lat: latitude, lng: longitude }
      zoom.value = 13
    },
    (error) => {
      console.error('Geolocation error:', error.code, error.message)

      switch (error.code) {
        case error.PERMISSION_DENIED:
          console.warn('User denied the request for Geolocation.')
          break
        case error.POSITION_UNAVAILABLE:
          console.warn('Location information is unavailable.')
          break
        case error.TIMEOUT:
          console.warn('The request to get user location timed out.')
          break
        default:
          console.warn('An unknown error occurred.')
      }

      centerMarker.value = tashkentDefaultLocation
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  )
}

const querySearch = (queryString: string, cb: (results: Array<{ value: string; place_id: string }>) => void) => {
  if (!autocompleteService.value) {
    autocompleteService.value = new google.maps.places.AutocompleteService()
  }

  autocompleteService.value.getPlacePredictions(
    {
      input: String(queryString),
      componentRestrictions: { country: 'UZ' },
      bounds: {
        east: 69.42,
        west: 69.14,
        north: 41.4,
        south: 41.17
      },
      types: ['geocode']
    },
    (predictions: MapPredictionDTO[], status: string) => {
      if (status === 'OK' && predictions) {
        const results = predictions.map((p) => ({
          value: p.description,
          place_id: p.place_id
        }))
        cb(results)
      } else {
        cb([])
      }
    }
  )
}

const handleSelect = (item: Record<string, string>) => {
  const geocoder = new (window as any).google.maps.Geocoder()
  geocoder.geocode({ placeId: item.place_id }, (results: any) => {
    if (results[0]) {
      const location = results[0].geometry.location
      centerMarker.value = {
        lat: location.lat(),
        lng: location.lng()
      }
      zoom.value = 15
      state1.value = item.value
    }
  })
}

const increaseZoom = () => {
  if (zoom.value < 18) {
    zoom.value++
  }
}

const decreaseZoom = () => {
  if (zoom.value > 11) {
    zoom.value--
  }
}

const handleClose = (done: () => void) => {
  done()
}

const openConfirmDialog = () => {
  if (centerValue.value) {
    confirmDialog.value = true
  }
}

const handleSubmit = async () => {
  const trackingNumber = getSessianStorage('trackingNumber')
  if (centerValue.value) {
    loading.value = true
    await personPvzService
      .addPersonPvz({
        latitude: centerValue.value?.lat,
        longitude: centerValue.value?.lng,
        fullAddress: centerValue.value?.fullAddress,
        service: 2,
        trackingNumber
      })
      .then(() => {
        ElMessage.success(t('successfully.added'))
        confirmDialog.value = false
        router.push('/serviceMap')
        removeSessianStorage('trackingNumber')
      })
      .catch((error) => {
        ElMessage.error(t('error.occurred'))
        console.error('Error saving address:', error)
      })
      .finally(() => {
        loading.value = false
      })
  }
}

const closeConfirmDialog = () => {
  confirmDialog.value = false
}

const warnHandle = () => {
  warnDraw.value = !warnDraw.value
}

const myLocationHandle = () => {
  zoom.value = 12
  fetchCurrentLocation()
}

let geocodeTimer: any = null

const handlePlaceChanged = async () => {
  const map = (mapRef as any).value?.map
  const center = map?.getCenter()
  const lat = center?.lat()
  const lng = center?.lng()

  if (!lat || !lng) return

  clearTimeout(geocodeTimer)

  geocodeTimer = setTimeout(async () => {
    // Toshkent chegarasini tekshirish
    const isInside = isPointInPolygon(lat, lng, tashkentBoundary)

    if (!isInside) {
      warn.value = true
      centerValue.value = null
      state1.value = ''
      return
    } else {
      warn.value = false
    }

    const geocoder = new google.maps.Geocoder()

    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const fullAddress = results[0].formatted_address
        state1.value = fullAddress
        centerValue.value = {
          lat,
          lng,
          fullAddress: fullAddress
        }
      } else {
        console.error('Google Geocode xatosi:', status)
      }
    })
  }, 600)
}

const handleCenterChanged = () => {
  centerValue.value = null
}

const positionStyle = {
  maxWidth: '470px',
  borderRadius: '24px',
  position: 'absolute',
  bottom: '20%',
  left: '50%',
  transform: 'translateX(-50%)'
}

onMounted(() => {
  fetchCurrentLocation()
  loading.value = true

  setTimeout(() => {
    loading.value = false
    setTimeout(() => {
      onMapReady()
    }, 500)
  }, 2000)
})

watch(centerValue, (newValue) => {
  yPosition.value = newValue ? 40 : 35
})
</script>

<template>
  <div class="fullMap homeDelivery" v-loading.fullscreen.lock="loading">
    <div v-if="mapLoading" class="loading-overlay">
      <img :src="LocationLoading" style="width: 150px; height: 250px; object-fit: contain; margin: auto" alt="" />
    </div>

    <GoogleMap
      ref="mapRef"
      :api-key="MAP_KEY"
      style="width: 100%; height: 100%"
      :center="centerMarker"
      :zoom="zoom"
      :disable-default-ui="true"
      :animation="1"
      :clickable-icons="false"
      :heading="10"
      :min-zoom="11"
      :max-zoom="18"
      language="en"
      @idle="handlePlaceChanged"
      @center_changed="handleCenterChanged"
      :libraries="['places']"
    >
      <!-- Marker nuqtasi -->
      <div class="marker__point">
        <svg xmlns="http://www.w3.org/2000/svg" width="45" height="65" viewBox="0 0 44 65" fill="none">
          <circle cx="22" cy="22" r="22" fill="black" />
          <circle cx="22" cy="22" r="4" fill="white" />
          <g opacity="0.25" filter="url(#filter0_f_17777_2049)">
            <ellipse cx="22" cy="58.5" rx="13" ry="2.5" fill="black" />
          </g>
          <rect x="21" :y="yPosition" width="2" height="18" rx="1" fill="black" class="animated-rect" />
          <defs>
            <filter
              id="filter0_f_17777_2049"
              x="5"
              y="52"
              width="34"
              height="13"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <feFlood flood-opacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="2" result="effect1_foregroundBlur_17777_2049" />
            </filter>
          </defs>
        </svg>
      </div>
    </GoogleMap>

    <div class="head-tab">
      <el-autocomplete
        v-model="state1"
        type="text"
        clearable
        class="inline-input"
        :placeholder="t('search')"
        :fetch-suggestions="querySearch"
        @select="handleSelect"
        multiline
        cols="40"
        :rows="5"
      >
        <template #prefix>
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="Group">
              <path
                id="Vector"
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M7.74997 0.666657C6.62046 0.666753 5.50735 0.93696 4.50351 1.45473C3.49967 1.97251 2.63421 2.72284 1.97933 3.64312C1.32445 4.5634 0.899142 5.62695 0.738891 6.74503C0.578639 7.86311 0.688092 9.0033 1.05812 10.0705C1.42814 11.1377 2.04801 12.1009 2.866 12.8798C3.68399 13.6587 4.67639 14.2306 5.7604 14.548C6.8444 14.8653 7.98859 14.9189 9.09748 14.7041C10.2064 14.4893 11.2478 14.0125 12.135 13.3133L15.1783 16.3567C15.3355 16.5085 15.546 16.5925 15.7645 16.5906C15.983 16.5887 16.192 16.501 16.3465 16.3465C16.501 16.192 16.5886 15.983 16.5905 15.7645C16.5924 15.546 16.5084 15.3355 16.3566 15.1783L13.3133 12.135C14.1366 11.0905 14.6493 9.83532 14.7926 8.51309C14.9358 7.19087 14.704 5.85501 14.1235 4.6584C13.543 3.4618 12.6374 2.45279 11.5102 1.74685C10.3831 1.04091 9.07994 0.666567 7.74997 0.666657ZM2.3333 7.74999C2.3333 6.3134 2.90398 4.93565 3.91981 3.91983C4.93563 2.90401 6.31338 2.33332 7.74997 2.33332C9.18656 2.33332 10.5643 2.90401 11.5801 3.91983C12.596 4.93565 13.1666 6.3134 13.1666 7.74999C13.1666 9.18658 12.596 10.5643 11.5801 11.5802C10.5643 12.596 9.18656 13.1667 7.74997 13.1667C6.31338 13.1667 4.93563 12.596 3.91981 11.5802C2.90398 10.5643 2.3333 9.18658 2.3333 7.74999Z"
                fill="#9CA3AF"
              />
            </g>
          </svg>
        </template>
        <template #clearable>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="Group">
              <path
                id="Vector"
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M6.99993 8.17833L11.7141 12.8925C11.8713 13.0443 12.0818 13.1283 12.3003 13.1264C12.5188 13.1245 12.7278 13.0368 12.8823 12.8823C13.0368 12.7278 13.1244 12.5188 13.1263 12.3003C13.1282 12.0818 13.0442 11.8713 12.8924 11.7142L8.17827 6.99999L12.8924 2.28583C13.0442 2.12866 13.1282 1.91816 13.1263 1.69966C13.1244 1.48116 13.0368 1.27215 12.8823 1.11764C12.7278 0.963137 12.5188 0.875496 12.3003 0.873597C12.0818 0.871698 11.8713 0.955694 11.7141 1.10749L6.99993 5.82166L2.28577 1.10749C2.12789 0.959446 1.91861 0.87863 1.70221 0.882144C1.48581 0.885658 1.27926 0.973227 1.12628 1.12632C0.97329 1.27941 0.885867 1.48602 0.882506 1.70243C0.879145 1.91883 0.96011 2.12805 1.10827 2.28583L5.8216 6.99999L1.10743 11.7142C1.02784 11.791 0.964357 11.883 0.920683 11.9847C0.877009 12.0863 0.85402 12.1957 0.853059 12.3063C0.852097 12.417 0.873182 12.5267 0.915083 12.6291C0.956983 12.7315 1.01886 12.8246 1.0971 12.9028C1.17535 12.9811 1.26839 13.0429 1.37081 13.0848C1.47322 13.1267 1.58295 13.1478 1.6936 13.1469C1.80425 13.1459 1.9136 13.1229 2.01527 13.0792C2.11694 13.0356 2.20889 12.9721 2.28577 12.8925L6.99993 8.17833Z"
                fill="#9CA3AF"
              />
            </g>
          </svg>
        </template>
      </el-autocomplete>

      <!-- Warning message -->
      <transition name="slide-down">
        <div v-if="warn" class="warn-banner">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 11C9.45 11 9 10.55 9 10V6C9 5.45 9.45 5 10 5C10.55 5 11 5.45 11 6V10C11 10.55 10.55 11 10 11ZM11 15H9V13H11V15Z"
              fill="#D81B51"
            />
          </svg>
          <p class="warn__error">{{ t('delivery.notAvailable') }}</p>
        </div>
      </transition>
    </div>

    <div class="zoom-controls">
      <button @click="increaseZoom">
        <img :src="plusSvg" :alt="plusSvg" />
      </button>
      <button @click="decreaseZoom">
        <img :src="minusSvg" :alt="minusSvg" />
      </button>
      <button @click="myLocationHandle">
        <img :src="locationSvg" :alt="locationSvg" />
      </button>
    </div>

    <div class="footer-button">
      <button @click="warnHandle">
        <img :src="warnSvg" :alt="warnSvg" />
      </button>
    </div>

    <div class="footer">
      <el-button :disabled="!centerValue" class="submit-btn" type="primary" @click="openConfirmDialog">
        {{ $t('select') }}
      </el-button>
    </div>

    <DynamicDialog v-model="confirmDialog" size="auto" :position-style="positionStyle" :title="''">
      <div class="p-0 flex flex-col bg-white overflow-hidden">
        <div class="relative flex justify-center pb-4 px-0">
          <div class="relative w-[64px] h-[64px] bg-[#044CA2]! rounded-full flex items-center justify-center z-10">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
                fill="white"
              />
            </svg>
          </div>
        </div>

        <div class="pt-0 px-0 pb-5 text-center">
          <p class="text-[24px] font-semibold text-[#111827] mb-2">{{ t('confirm.your.location') }}</p>
          <p class="text-[14px] font-medium text-[#111827]">{{ t('delivery.to.this.address') }}</p>
        </div>

        <div
          style="border: 1px solid #e5e7eb"
          class="mt-0 mb-2 p-4 bg-[#F9FAFB] border-[1.5px] border-[#E5E7EB] rounded-[16px] flex items-start gap-3 transition-all duration-300 hover:bg-[#F3F4F6] hover:border-[#D1D5DB]"
        >
          <div class="shrink-0 w-10 h-10 bg-white rounded-[12px] flex items-center justify-center shadow-md">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10 2C6.69 2 4 4.69 4 8C4 12.5 10 18 10 18C10 18 16 12.5 16 8C16 4.69 13.31 2 10 2ZM10 10C8.9 10 8 9.1 8 8C8 6.9 8.9 6 10 6C11.1 6 12 6.9 12 8C12 9.1 11.1 10 10 10Z"
                fill="#044CA2"
              />
            </svg>
          </div>

          <p class="flex-1 text-[15px] font-medium text-[#111827] leading-[1.51] m-0 pt-1">
            {{ centerValue?.fullAddress }}
          </p>
        </div>

        <div class="mb-5 py-3 px-4 bg-[#EFF6FF] rounded-[12px] flex items-center gap-[10px]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="shrink-0"
          >
            <path
              d="M8 1C4.13438 1 1 4.13438 1 8C1 11.8656 4.13438 15 8 15C11.8656 15 15 11.8656 15 8C15 4.13438 11.8656 1 8 1ZM8 11C7.71875 11 7.5 10.7812 7.5 10.5V8C7.5 7.71875 7.71875 7.5 8 7.5C8.28125 7.5 8.5 7.71875 8.5 8V10.5C8.5 10.7812 8.28125 11 8 11ZM8.5 6H7.5V5H8.5V6Z"
              fill="#6B7280"
            />
          </svg>

          <span class="text-[13px] font-medium text-[#374151] mt-1 leading-[1.5]">
            {{ t('you.can.change.anytime') }}
          </span>
        </div>

        <div class="flex items-center justify-center gap-2">
          <el-button
            @click="closeConfirmDialog"
            class="bg-[#fff]! border! border-[#E5E7EB]! text-[#111827]! !font-medium! w-full! h-12! hover:bg-[#E5E7EB]!"
          >
            <span>{{ t('cancel') }}</span>
          </el-button>
          <el-button
            @click="handleSubmit"
            :disabled="loading"
            :loading="loading"
            class="bg-[#111827]! text-white! font-medium! w-full! h-12!"
          >
            <span>{{ t('save.address') }}</span>
          </el-button>
        </div>
      </div>
    </DynamicDialog>

    <el-drawer
      v-if="warnDraw"
      v-model="warnDraw"
      title="Search"
      :direction="direction"
      :before-close="handleClose"
      :modal="true"
      :with-header="false"
    >
      <svg width="65" height="4" viewBox="0 0 65 4" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.5" width="64" height="4" rx="2" fill="#E5E7EB" />
      </svg>
      <div class="warn_cy">
        <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g id="Group">
            <path
              id="Vector"
              d="M12.4999 0.333333C18.9434 0.333333 24.1666 5.5565 24.1666 12C24.1666 18.4435 18.9434 23.6667 12.4999 23.6667C6.05642 23.6667 0.833252 18.4435 0.833252 12C0.833252 5.5565 6.05642 0.333333 12.4999 0.333333ZM12.4999 2.66667C10.0246 2.66667 7.65059 3.65 5.90026 5.40034C4.14992 7.15068 3.16659 9.52465 3.16659 12C3.16659 14.4754 4.14992 16.8493 5.90026 18.5997C7.65059 20.35 10.0246 21.3333 12.4999 21.3333C14.9753 21.3333 17.3492 20.35 19.0996 18.5997C20.8499 16.8493 21.8333 14.4754 21.8333 12C21.8333 9.52465 20.8499 7.15068 19.0996 5.40034C17.3492 3.65 14.9753 2.66667 12.4999 2.66667ZM12.4999 15.5C12.8093 15.5 13.1061 15.6229 13.3249 15.8417C13.5437 16.0605 13.6666 16.3572 13.6666 16.6667C13.6666 16.9761 13.5437 17.2728 13.3249 17.4916C13.1061 17.7104 12.8093 17.8333 12.4999 17.8333C12.1905 17.8333 11.8938 17.7104 11.675 17.4916C11.4562 17.2728 11.3333 16.9761 11.3333 16.6667C11.3333 16.3572 11.4562 16.0605 11.675 15.8417C11.8938 15.6229 12.1905 15.5 12.4999 15.5ZM12.4999 5C12.8093 5 13.1061 5.12292 13.3249 5.34171C13.5437 5.5605 13.6666 5.85725 13.6666 6.16667V13.1667C13.6666 13.4761 13.5437 13.7728 13.3249 13.9916C13.1061 14.2104 12.8093 14.3333 12.4999 14.3333C12.1905 14.3333 11.8938 14.2104 11.675 13.9916C11.4562 13.7728 11.3333 13.4761 11.3333 13.1667V6.16667C11.3333 5.85725 11.4562 5.5605 11.675 5.34171C11.8938 5.12292 12.1905 5 12.4999 5Z"
              fill="white"
            />
          </g>
        </svg>
      </div>
      <p class="warn__text">{{ $t('warning.tashkent.only') }}</p>
      <el-button class="submit-btn" @click="warnHandle" type="primary">{{ $t('translate') }}</el-button>
    </el-drawer>
  </div>
</template>

<style lang="scss">
.fullMap {
  max-width: 600px;
  height: 100%;
  position: relative;
  margin: 0 auto;
}

.animated-rect {
  transition: y 0.2s ease-in-out;
}

.marker__point {
  position: absolute;
  top: 48%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
  pointer-events: none;
}

.warn-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #d81b5146;
  border: 1px solid rgba(216, 27, 81, 0.3);
  border-radius: 12px;
  margin-top: 8px;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.warn__error {
  color: #d81b51;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 1.4;
  margin: 0;
}

.head-tab {
  position: absolute;
  top: 0;
  padding: 16px 12px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(180deg, #fff 0%, rgba(255, 255, 255, 0) 100%);
  z-index: 10;

  .el-input__wrapper {
    display: flex;
    width: 100%;
    height: 48px;
    padding: 0px 12px;
    align-items: center;
    box-shadow: none;
    border-radius: 32px;
    background: var(--gray-200, #e5e7eb);
  }

  :deep(.el-autocomplete .el-input__icon) {
    color: red;
    font-size: 20px;
  }

  .el-autocomplete {
    width: 100%;
  }

  .el-input__inner {
    color: var(--main-label, #111827) !important;
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: 120%;
  }
}

.submit-btn {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 24px;
  border-radius: 32px;
  background: var(--main-secondary, #111827);
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 10%;
  color: #ffffff;
  left: 0;
  box-shadow: none;
  outline: none;
  border: none;
  margin-top: auto;
}

.zoom-controls,
.footer-button {
  position: absolute;
  right: 12px;
  bottom: 30%;
  display: grid;
  gap: 12px;
  z-index: 10;

  button {
    background: #fff;
    border: 0;
    font-size: 28px;
    box-shadow: 0px 3px 8px 0px #1118270d;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 48px !important;
    height: 48px !important;
    border-radius: 50%;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    overflow: hidden;

    &:active {
      opacity: 0.8;
    }
  }
}

.footer-button {
  display: flex;
  width: 100%;
  justify-content: flex-end;
  top: 80%;
  right: 0;
  padding: 0 12px;
}

.footer {
  position: absolute;
  bottom: 2%;
  width: 100%;
  padding: 12px;
  z-index: 10;
}

.el-drawer {
  max-width: 580px;
  margin: 0 auto;
  border-radius: var(--Sizes-size-20, 20px) var(--Sizes-size-20, 20px) 0px 0px;
  background: var(--system-white, #fff);

  .warn__text {
    color: var(--main-label, #111827);
    text-align: center;
    font-size: 15px;
    font-style: normal;
    font-weight: 600;
    line-height: 120%;
  }

  .el-drawer__body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 10px 14px 16px !important;
  }

  .warn_cy {
    display: flex;
    width: 64px;
    height: 64px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    border-radius: 32px;
    background: var(--main-warning, #ff9500);
    margin: 0 auto;
  }
}
</style>
