<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { ENV } from '@/config/env'
import { reactive, ref } from 'vue'
import { GoogleMap } from 'vue3-google-map'
import { ElMessage } from 'element-plus'

// SVG va rasm importlari
import ClearIcon from '@/assets/svg/clear.svg'
import SearchIcon from '@/assets/svg/search.svg'
import deleteSvg from '@/assets/svg/red-trash.svg'
import WarningAlertIcon from '@/assets/svg/alert-danger.svg'
import LocationLoading from '@/assets/profile/locationLoading.gif'
import plusSvg from '@/views/map/images/plus.svg?url'
import minusSvg from '@/views/map/images/minus.svg?url'

// Loyiha ichidagi boshqa komponent va utilitlar
import { tashkentDefaultLocation } from '@/constants/api'
import { tashkentBoundary } from '@/constants/tashkentBoundary'
import DynamicDialog from '@/components/DynamicDialog/DynamicDialog.vue'
import { useAddPersonPvzMutation } from '@/hooks/mutations/usePvzMutation'
import { useGeolocation } from '@/hooks/useGelocation'
import CurrentLocationButton from '@/components/shared/CurrentLocationButton.vue'

const { t } = useI18n()

// Map va UI holatlari
const mapRef = ref(null)
const zoom = ref<number>(12)
const state1 = ref<string>('')
const warn = ref<boolean>(false)
const yPosition = ref<number>(35)
const centerValue = ref<any>(null)
const isEdit = ref<boolean>(false)
const deleteLocationDialog = ref()
const loading = ref<boolean>(false)
const mapLoading = ref<boolean>(false)
const dialogVisible = ref<boolean>(false)
const centerMarker = ref<{ lat: number; lng: number }>(tashkentDefaultLocation)

const editedPvzData = reactive({
  lat: null,
  lng: null,
  fullAddress: '',
  id: null
})

const KEY = ENV.GOOGLE_API_KEY

// Geolocation hook - foydalanuvchining hozirgi o'rnini aniqlash
const { handleLocation } = useGeolocation({
  onSuccess: ({ lat, lng }) => {
    centerMarker.value = { lat, lng }
    zoom.value = 13
  },
  onDenied: () => {
    console.warn('Permission denied')
  },
  fallback: () => {
    centerMarker.value = tashkentDefaultLocation
  }
})

// Dialogni ko'rsatish funksiyasi
const show = (): void => {
  dialogVisible.value = true
}

const querySearch = async (query: string, cb: (arg: any[]) => void): Promise<any> => {
  if (query.length < 3) return cb([])

  // Toshkent hududi bilan cheklash
  const viewbox = '69.0,41.1,69.4,41.4'
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&viewbox=${viewbox}&bounded=1&addressdetails=1&accept-language=uz`

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'PvzManagementApp/1.0' }
    })
    const data = await response.json()

    const results = data.map((item: any) => ({
      value: item.display_name,
      lat: item.lat,
      lng: item.lon
    }))
    cb(results)
  } catch (error) {
    console.error('OSM Search error:', error)
    return cb([])
  }
}

const handleSelect = (item: any) => {
  const lat = parseFloat(item.lat)
  const lng = parseFloat(item.lng)

  centerMarker.value = { lat, lng }
  zoom.value = 17
  state1.value = item.value
  centerValue.value = { lat, lng, fullAddress: item.value }
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

const handlePlaceChanged = async () => {
  const map = (mapRef as any).value?.map
  const center = map?.getCenter()
  const lat = center?.lat()
  const lng = center?.lng()

  if (!lat || !lng) return

  const isInside = isPointInPolygon(lat, lng, tashkentBoundary)

  if (!isInside) {
    warn.value = true
    centerValue.value = null
    return
  } else {
    warn.value = false
  }

  // const apiKey = 'd40481eb-0884-40a5-bde1-9cfb8d7cfa89'
  // const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&geocode=${lng},${lat}&format=json&lang=uz`

  // BEPUL OSM Nominatim Reverse Geocode
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=uz`

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'PvzManagementApp/1.0' }
    })
    const data = await response.json()

    if (data && data.display_name) {
      state1.value = data.display_name
      centerValue.value = { lat, lng, fullAddress: data.display_name }
    }
  } catch (error) {
    console.error('OSM Geocoder error:', error)
  }
}

const handleCenterChanged = () => {
  centerValue.value = null
}

const decreaseZoom = () => {
  if (zoom.value > 1) zoom.value--
}

const increaseZoom = () => {
  if (zoom.value < 21) zoom.value++
}

const handleDeleteLocation = () => {
  deleteLocationDialog.value.show(editedPvzData)
}

const closeMapDialog = () => {
  centerValue.value = null
  dialogVisible.value = false
  isEdit.value = false
}

const { mutateAsync, isPending } = useAddPersonPvzMutation()

const handleConfirm = async () => {
  if (!centerValue.value) return

  try {
    await mutateAsync({
      latitude: centerValue.value.lat,
      longitude: centerValue.value.lng,
      fullAddress: centerValue.value.fullAddress,
      service: 2
    })
    dialogVisible.value = false
    ElMessage.success(t('successfully.added'))
  } catch (error: any) {
    console.error('Saqlashda xatolik:', error)
    ElMessage.error(error?.response?.data?.message || t('message.error'))
  }
}

defineExpose({ show })

const positionStyle = {
  maxWidth: '600px',
  borderRadius: '24px',
  position: 'absolute',
  height: 'fit-content',
  bottom: '0%',
  left: '50%',
  top: '-13%',
  transform: 'translateX(-50%)'
}
</script>

<template>
  <DynamicDialog :position-style="positionStyle" v-model="dialogVisible" size="auto" :title="t('add.address')">
    <div class="max-w-full w-full h-full relative my-0 mx-auto" v-loading.fullscreen.lock="loading">
      <div class="head-ta home-delivery-map w-full flex flex-col justify-center items-center mb-5">
        <el-autocomplete
          v-model="state1"
          type="text"
          clearable
          class="inline-input h-12! w-full! rounded-[16px]! shadow-none! border-none! bg-transparent!"
          :disabled="mapLoading"
          :placeholder="t('search')"
          :fetch-suggestions="querySearch"
          @select="handleSelect"
        >
          <template #prefix><img :src="SearchIcon" alt="search" /></template>
          <template #clearable><img :src="ClearIcon" alt="clear" /></template>
        </el-autocomplete>
      </div>

      <div
        v-if="mapLoading"
        class="absolute top-0 left-0 w-full h-full bg-[#ffffffcc] flex items-center justify-center text-[20px] font-semibold"
      >
        <img :src="LocationLoading" style="width: 150px; height: 250px; object-fit: contain; margin: auto" alt="" />
      </div>

      <div
        class="w-full rounded-[16px] border border-[#d81b511a] bg-[#D81B511A] p-3 flex items-center justify-start gap-2 mb-5"
        v-if="warn"
      >
        <img :src="WarningAlertIcon" />
        <p class="m-0 text-[#6B7280] text-[13px] leading-[20px]">{{ t('delivery.notAvailable') }}</p>
      </div>

      <div class="map-container relative w-full h-[440px] rounded-[16px]! overflow-hidden">
        <GoogleMap
          class="maps"
          ref="mapRef"
          :api-key="KEY"
          style="width: 100%; height: 100%; position: relative"
          :center="centerMarker"
          :zoom="zoom"
          :disable-default-ui="true"
          :animation="1"
          @load="mapLoading = false"
          :clickable-icons="false"
          language="uz"
          @idle="handlePlaceChanged"
          @center_changed="handleCenterChanged"
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

        <div class="absolute right-2 bottom-[5%] grid gap-2">
          <button
            v-if="isEdit"
            class="bg-white border-none text-[28px] flex items-center justify-center w-12 h-12 rounded-full overflow-hidden cursor-pointer active:opacity-80 shadow-md"
            @click="handleDeleteLocation"
          >
            <img class="delete-btn" :src="deleteSvg" />
          </button>

          <button
            class="bg-white border-none text-[28px] flex items-center justify-center w-12 h-12 rounded-full overflow-hidden cursor-pointer active:opacity-80 shadow-md"
            @click="increaseZoom"
          >
            <img :src="plusSvg" alt="zoom-in" />
          </button>

          <button
            class="bg-white border-none text-[28px] flex items-center justify-center w-12 h-12 rounded-full overflow-hidden cursor-pointer active:opacity-80 shadow-md"
            @click="decreaseZoom"
          >
            <img :src="minusSvg" alt="zoom-out" />
          </button>
          <CurrentLocationButton @click="handleLocation" />
        </div>
      </div>

      <div class="flex mt-6 gap-2">
        <el-button
          class="w-full! h-12 rounded-[16px]! text-[15px]! font-medium! text-[#111827]!"
          @click="closeMapDialog"
        >
          {{ t('cancel') }}
        </el-button>
        <el-button
          :loading="!centerValue || isPending"
          class="w-full! h-12 rounded-[16px]! text-[15px]! font-medium! text-white! bg-[#030712]!"
          :disabled="!centerValue"
          @click="handleConfirm"
        >
          {{ isEdit ? t('save') : t('save.address') }}
        </el-button>
      </div>
    </div>
  </DynamicDialog>
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

.home-delivery-map .el-input__wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  border: 1px solid #e5e7eb !important;
  box-shadow: none;
  border-radius: 16px !important;
  background: transparent !important;
  font-size: 14px !important;
}

.head-tab {
  .el-input__wrapper {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    border: 2px solid #e5e7eb !important;
    box-shadow: none;
    border-radius: 16px !important;
    background: transparent;
    font-size: 13px !important;
  }

  .el-autocomplete {
    width: 100%;
    height: 40px;
    border-radius: 32px !important;
  }

  .el-input__inner {
    color: var(--main-label, #111827) !important;
    font-size: 14px;
    font-weight: 500;
  }
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
}
</style>
