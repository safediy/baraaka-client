<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { ref, computed, watch } from 'vue'
import { GoogleMap } from 'vue3-google-map'
import { MapPredictionDTO } from 'types/api'
import personPvzService from '@/api/PersonPvz'
import { ElMessage } from 'element-plus'
import { tashkentDefaultLocation } from '@/constants/api'
import { getSessianStorage, removeSessianStorage } from '@/utils/cache/cookies'

import plusSvg from '@/views/map/images/plus.svg?url'
import warnSvg from '@/views/map/images/warn.svg?url'
import minusSvg from '@/views/map/images/minus.svg?url'
import locationSvg from '@/views/map/images/location.svg?url'
import LocationLoading from '@/assets/profile/locationLoading.gif'
import { ENV } from '@/config/env'

// Props
interface Props {
  mode?: 'create' | 'select' // create - yangi yaratish, select - ro'yxatdan tanlash
  locationType?: 'home' | 'pvz' // home - uyga yetkazish, pvz - punktga yetkazish
  showMap?: boolean // mapni ko'rsatish kerakmi
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
  locationType: 'home',
  showMap: true
})

// Emits
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved', location: any): void
  (e: 'selected', location: any): void
}>()

const { t } = useI18n()
const KEY = ENV.GOOGLE_API_KEY

const zoom = ref(12)
const state1 = ref('')
const mapRef = ref(null)
const yPosition = ref(35)
const warn = ref<boolean>(false)
const centerValue = ref<any>(null)
const loading = ref<boolean>(false)
const warnDraw = ref<boolean>(false)
const mapLoading = ref<boolean>(false)
const autocompleteService = ref<any>(null)
const centerMarker = ref<{ lat: number; lng: number }>(tashkentDefaultLocation)

// Service ID based on location type
const serviceId = computed(() => {
  return props.locationType === 'home' ? 2 : 1 // 2 - home delivery, 1 - pvz
})

const fetchCurrentLocation = async () => {
  if (!navigator?.geolocation || !navigator?.permissions) {
    centerMarker.value = tashkentDefaultLocation
    return
  }

  try {
    const permissionStatus = await navigator.permissions.query({ name: 'geolocation' })

    if (permissionStatus.state === 'granted') {
      getCurrentPosition()
    } else if (permissionStatus.state === 'prompt') {
      getCurrentPosition()
    } else {
      console.warn('Geolocation permission has been denied.')
      centerMarker.value = tashkentDefaultLocation
    }

    permissionStatus.onchange = () => {
      if (permissionStatus.state === 'granted') {
        getCurrentPosition()
      } else if (permissionStatus.state === 'denied') {
        centerMarker.value = tashkentDefaultLocation
      }
    }
  } catch (error) {
    centerMarker.value = tashkentDefaultLocation
  }
}

const getCurrentPosition = () => {
  navigator.geolocation.getCurrentPosition(
    ({ coords: { latitude, longitude } }) => {
      centerMarker.value = { lat: latitude, lng: longitude }
      zoom.value = 13
    },
    (error) => {
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
        east: 69.4,
        west: 69.0,
        north: 41.4,
        south: 41.1
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
  const geocoder = new google.maps.Geocoder()
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
  if (zoom.value < 21) {
    zoom.value++
  }
}

const decreaseZoom = () => {
  if (zoom.value > 1) {
    zoom.value--
  }
}

const handleSubmit = async () => {
  const trackingNumber = getSessianStorage('trackingNumber')

  if (!centerValue.value) {
    ElMessage.warning(t('please.select.location'))
    return
  }

  loading.value = true

  try {
    const locationData = {
      latitude: centerValue.value?.lat,
      longitude: centerValue.value?.lng,
      fullAddress: centerValue.value?.fullAddress,
      service: serviceId.value,
      trackingNumber
    }

    await personPvzService.addPersonPvz(locationData)

    ElMessage.success(t('successfully.added'))
    emit('saved', locationData)
    removeSessianStorage('trackingNumber')
  } catch (error: any) {
    ElMessage.error(error?.message || t('error.occurred'))
  } finally {
    loading.value = false
  }
}

const warnHandle = () => {
  warnDraw.value = !warnDraw.value
}

const myLocationHandle = () => {
  zoom.value = 6
  fetchCurrentLocation()
}

const handlePlaceChanged = async () => {
  const map = (mapRef as any).value?.map
  const center = map?.getCenter()

  const lat = center?.lat()
  const lng = center?.lng()

  const bounds = {
    east: 69.4,
    west: 69.1414395285147,
    north: 41.4,
    south: 41.176214347117595
  }

  if (lat < bounds.south || lat > bounds.north || lng < bounds.west || lng > bounds.east) {
    warn.value = true
    return
  } else {
    warn.value = false
  }

  const apiKey = 'd40481eb-0884-40a5-bde1-9cfb8d7cfa89'
  const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&geocode=${lng},${lat}&format=json&lang=uz`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data?.response?.GeoObjectCollection?.featureMember.length > 0) {
      const formatted_address =
        data?.response?.GeoObjectCollection?.featureMember[0].GeoObject.metaDataProperty.GeocoderMetaData.text

      state1.value = formatted_address
      centerValue.value = { lat, lng, fullAddress: formatted_address }
    }
  } catch (error) {
    console.error('Yandex Geocoder error:', error)
  }
}

const handleCenterChanged = () => {
  centerValue.value = null
}

const handleClose = () => {
  emit('close')
}

// Initialize
fetchCurrentLocation()

watch(centerValue, (newValue) => {
  yPosition.value = newValue ? 40 : 35
})
</script>

<template>
  <div class="location-selector" v-loading.fullscreen.lock="loading">
    <div v-if="mapLoading" class="loading-overlay">
      <img :src="LocationLoading" style="width: 150px; height: 250px; object-fit: contain; margin: auto" alt="" />
    </div>

    <!-- Map Section -->
    <div v-if="showMap" class="map-container">
      <GoogleMap
        ref="mapRef"
        :api-key="KEY"
        style="width: 100%; height: 400px"
        :center="centerMarker"
        :zoom="zoom"
        :disable-default-ui="true"
        :animation="1"
        :clickable-icons="false"
        :heading="10"
        :min-zoom="6"
        language="en"
        @idle="handlePlaceChanged"
        @center_changed="handleCenterChanged"
        :libraries="['places']"
      >
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

      <!-- Search Bar -->
      <div class="head-tab">
        <el-autocomplete
          v-model="state1"
          type="text"
          clearable
          class="inline-input"
          :placeholder="t('search')"
          :fetch-suggestions="querySearch"
          @select="handleSelect"
        >
          <template #prefix>
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M7.74997 0.666657C6.62046 0.666753 5.50735 0.93696 4.50351 1.45473C3.49967 1.97251 2.63421 2.72284 1.97933 3.64312C1.32445 4.5634 0.899142 5.62695 0.738891 6.74503C0.578639 7.86311 0.688092 9.0033 1.05812 10.0705C1.42814 11.1377 2.04801 12.1009 2.866 12.8798C3.68399 13.6587 4.67639 14.2306 5.7604 14.548C6.8444 14.8653 7.98859 14.9189 9.09748 14.7041C10.2064 14.4893 11.2478 14.0125 12.135 13.3133L15.1783 16.3567C15.3355 16.5085 15.546 16.5925 15.7645 16.5906C15.983 16.5887 16.192 16.501 16.3465 16.3465C16.501 16.192 16.5886 15.983 16.5905 15.7645C16.5924 15.546 16.5084 15.3355 16.3566 15.1783L13.3133 12.135C14.1366 11.0905 14.6493 9.83532 14.7926 8.51309C14.9358 7.19087 14.704 5.85501 14.1235 4.6584C13.543 3.4618 12.6374 2.45279 11.5102 1.74685C10.3831 1.04091 9.07994 0.666567 7.74997 0.666657ZM2.3333 7.74999C2.3333 6.3134 2.90398 4.93565 3.91981 3.91983C4.93563 2.90401 6.31338 2.33332 7.74997 2.33332C9.18656 2.33332 10.5643 2.90401 11.5801 3.91983C12.596 4.93565 13.1666 6.3134 13.1666 7.74999C13.1666 9.18658 12.596 10.5643 11.5801 11.5802C10.5643 12.596 9.18656 13.1667 7.74997 13.1667C6.31338 13.1667 4.93563 12.596 3.91981 11.5802C2.90398 10.5643 2.3333 9.18658 2.3333 7.74999Z"
                fill="#9CA3AF"
              />
            </svg>
          </template>
        </el-autocomplete>
        <p v-if="warn" class="warn__error">{{ t('delivery.notAvailable') }}</p>
      </div>

      <!-- Map Controls -->
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
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <el-button @click="handleClose" class="cancel-btn">{{ t('cancel') }}</el-button>
      <el-button :disabled="!centerValue" class="submit-btn" type="primary" :loading="loading" @click="handleSubmit">
        {{ t('save.address') }}
      </el-button>
    </div>

    <!-- Warning Drawer -->
    <el-drawer v-model="warnDraw" title="Warning" direction="btt" :modal="true" :with-header="false">
      <div class="warn-content">
        <svg width="65" height="4" viewBox="0 0 65 4" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.5" width="64" height="4" rx="2" fill="#E5E7EB" />
        </svg>
        <div class="warn_cy">
          <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12.4999 0.333333C18.9434 0.333333 24.1666 5.5565 24.1666 12C24.1666 18.4435 18.9434 23.6667 12.4999 23.6667C6.05642 23.6667 0.833252 18.4435 0.833252 12C0.833252 5.5565 6.05642 0.333333 12.4999 0.333333ZM12.4999 2.66667C10.0246 2.66667 7.65059 3.65 5.90026 5.40034C4.14992 7.15068 3.16659 9.52465 3.16659 12C3.16659 14.4754 4.14992 16.8493 5.90026 18.5997C7.65059 20.35 10.0246 21.3333 12.4999 21.3333C14.9753 21.3333 17.3492 20.35 19.0996 18.5997C20.8499 16.8493 21.8333 14.4754 21.8333 12C21.8333 9.52465 20.8499 7.15068 19.0996 5.40034C17.3492 3.65 14.9753 2.66667 12.4999 2.66667ZM12.4999 15.5C12.8093 15.5 13.1061 15.6229 13.3249 15.8417C13.5437 16.0605 13.6666 16.3572 13.6666 16.6667C13.6666 16.9761 13.5437 17.2728 13.3249 17.4916C13.1061 17.7104 12.8093 17.8333 12.4999 17.8333C12.1905 17.8333 11.8938 17.7104 11.675 17.4916C11.4562 17.2728 11.3333 16.9761 11.3333 16.6667C11.3333 16.3572 11.4562 16.0605 11.675 15.8417C11.8938 15.6229 12.1905 15.5 12.4999 15.5ZM12.4999 5C12.8093 5 13.1061 5.12292 13.3249 5.34171C13.5437 5.5605 13.6666 5.85725 13.6666 6.16667V13.1667C13.6666 13.4761 13.5437 13.7728 13.3249 13.9916C13.1061 14.2104 12.8093 14.3333 12.4999 14.3333C12.1905 14.3333 11.8938 14.2104 11.675 13.9916C11.4562 13.7728 11.3333 13.4761 11.3333 13.1667V6.16667C11.3333 5.85725 11.4562 5.5605 11.675 5.34171C11.8938 5.12292 12.1905 5 12.4999 5Z"
              fill="white"
            />
          </svg>
        </div>
        <p class="warn__text">{{ t('warning.tashkent.only') }}</p>
        <el-button class="submit-btn" @click="warnHandle" type="primary">{{ t('translate') }}</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.location-selector {
  width: 100%;
  position: relative;
}

.map-container {
  width: 100%;
  height: 400px;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
}

.animated-rect {
  transition: y 0.2s ease-in-out;
}

.marker__point {
  position: absolute;
  top: 48%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.warn__error {
  color: var(--main-error, #d81b51);
  font-size: 15px;
  font-style: normal;
  font-weight: 500;
  line-height: 130%;
  margin-top: 6px;
  text-align: center;
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

  .el-autocomplete {
    width: 100%;
  }

  :deep(.el-input__wrapper) {
    display: flex;
    width: 100%;
    height: 48px;
    padding: 0px 12px;
    align-items: center;
    box-shadow: none;
    border-radius: 32px;
    background: var(--gray-200, #e5e7eb);
  }

  :deep(.el-input__inner) {
    color: var(--main-label, #111827) !important;
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: 120%;
  }
}

.zoom-controls {
  position: absolute;
  right: 12px;
  bottom: 80px;
  display: flex;
  flex-direction: column;
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
    width: 48px;
    height: 48px;
    border-radius: 50%;
    cursor: pointer;

    &:active {
      opacity: 0.8;
    }
  }
}

.footer-button {
  position: absolute;
  bottom: 20px;
  right: 12px;
  z-index: 10;

  button {
    background: #fff;
    border: 0;
    box-shadow: 0px 3px 8px 0px #1118270d;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    cursor: pointer;

    &:active {
      opacity: 0.8;
    }
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
  margin-top: 16px;

  .cancel-btn,
  .submit-btn {
    flex: 1;
    height: 48px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 600;
  }

  .cancel-btn {
    background: var(--gray-100, #f3f4f6);
    color: var(--main-label, #111827);
    border: none;
  }

  .submit-btn {
    background: var(--main-secondary, #111827);
    color: #ffffff;
    border: none;

    &:disabled {
      background: #959699;
      cursor: not-allowed;
    }
  }
}

.warn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;

  .warn_cy {
    display: flex;
    width: 64px;
    height: 64px;
    justify-content: center;
    align-items: center;
    border-radius: 32px;
    background: var(--main-warning, #ff9500);
  }

  .warn__text {
    color: var(--main-label, #111827);
    text-align: center;
    font-size: 15px;
    font-weight: 600;
    line-height: 120%;
  }
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
</style>
