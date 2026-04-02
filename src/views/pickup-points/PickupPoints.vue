<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { GoogleMap, MarkerCluster, CustomMarker } from 'vue3-google-map'
import type { Renderer } from '@googlemaps/markerclusterer'
import pvzListService from '@/api/PvzList'
import { useI18n } from 'vue-i18n'

import plusSvg from '@/views/map/images/plus.svg?url'
import minusSvg from '@/views/map/images/minus.svg?url'
import searchSvg from '@/views/map/images/search.svg?url'
import locationSvg from '@/views/map/images/location.svg?url'

import LeftIcon from '@/assets/svg/left-arrow.svg'
import SearchList from '@/views/map/searchList.vue'

import type { AddressTypesDTO } from 'types/pickupPoints'
import { tashkentDefaultLocation } from '@/constants/api'
import { useRouter } from 'vue-router'
import { formatPhone } from '@/utils'
import DynamicDialog from '@/components/DynamicDialog/DynamicDialog.vue'

import UzpostLogo from '@/assets/svg/uzPost.svg'
import UzpostMapLogo from '@/assets/service-images/uzpostMap.svg'

import RelogLogo from '@/assets/relog.png'

import BtsLogo from '@/assets/service-images/bts.svg'
import BtsMapLogo from '@/assets/service-images/btsMap.svg'

import EmuIconSvg from '@/assets/svg/emu-icon.svg?url'
import EmuLogo from '@/views/map/images/emu.svg?url'

import StarexIconSvg from '@/assets/service-images/starex-icon.svg?url'
import StarexLogo from '@/assets/service-images/starex.svg?url'

import IpostLogo from '@/assets/service-images/ipost.svg?url'
import IpostMapLogo from '@/assets/service-images/ipostMap.svg?url'
import { ENV } from '@/config/env'

defineOptions({
  name: 'MapScreen'
})

const { t } = useI18n()

type CenterType = {
  lat: number
  lng: number
  timestamp: number
}

const color: Record<number, string> = {
  1: '#F07824',
  2: '#4F2A7D',
  3: '#044CA2',
  4: '#8E3A92',
  5: '#192088',
  6: '#E9671E'
}

const serviceSvg: Record<number, string> = {
  1: UzpostLogo,
  2: RelogLogo,
  3: IpostLogo,
  4: EmuLogo,
  5: StarexLogo,
  6: BtsLogo
}

const serviceTitle: Record<number, string> = {
  1: 'UZPOST',
  2: 'RELOG',
  3: 'IPOST',
  4: 'EMU',
  5: 'STAREX',
  6: 'BTS'
}

const serviceLogoOnMap: Record<number, string> = {
  1: UzpostMapLogo,
  2: RelogLogo,
  3: IpostMapLogo,
  4: EmuIconSvg,
  5: StarexIconSvg,
  6: BtsMapLogo
}

const serviceSize: Record<number, number> = {
  1: 55,
  2: 55,
  3: 75,
  4: 55,
  5: 55,
  6: 55
}

const router = useRouter()
const KEY = ENV.GOOGLE_API_KEY

const center = ref<CenterType>({ lat: 41, lng: 69, timestamp: 0 })
const locations = ref<AddressTypesDTO[]>([])

const mapRef = ref(null)
const zoom = ref<number>(12)
const service = ref<number>(0)
const selected = ref<any | null>(null)

const selectedPhones = computed<string[]>(() => {
  const raw = selected.value?.phone ?? ''
  return raw
    .split(',')
    .map((p: string) => p.trim())
    .filter((p: string) => p.length > 0)
})

const phoneNumber = computed<string[]>(() => {
  const raw = selected.value?.phoneNumber ?? ''
  return raw
    .split(',')
    .map((p: string) => p.trim())
    .filter((p: string) => p.length > 0)
})

const getPhoneDigits = (phone: string): string => phone?.replace(/\D/g, '') ?? ''
const shouldPrefixPlus = (phone: string): any => getPhoneDigits(phone).length >= 11
const loading = ref<boolean>(false)
const searchDraw = ref<boolean>(false)
const dialogVisible = ref<boolean>(false)
const direction = ref<'btt' | 'ttb' | 'ltr' | 'rtl'>('btt')

const telegramService = window.Telegram

telegramService.WebApp.ready()
telegramService.WebApp.BackButton.show()
telegramService.WebApp.BackButton.onClick(() => {
  router.back()
})

const handleOpenLinkInTelegram = (phone: string) => {
  if (telegramService.WebApp.initData) {
    telegramService.WebApp.openLink(phone)
  }
}

const fetchCurrentLocation = () => {
  if (!navigator?.geolocation) {
    console.error('Geolocation is not supported by this browser.')
    return
  }

  navigator.geolocation.getCurrentPosition(
    ({ coords: { latitude, longitude }, timestamp }) => {
      center.value = { lat: latitude, lng: longitude, timestamp }
      zoom.value = 13
    },
    (error) => {
      console.error(`Failed to get location (${error.code}): ${error.message}`)
      center.value = { ...tashkentDefaultLocation, timestamp: Date.now() }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  )
}

const selectMarker = (location: AddressTypesDTO) => {
  dialogVisible.value = true
  searchDraw.value = false
  zoom.value = 0
  center.value = { lat: location.latitude, lng: location.longitude, timestamp: Date.now() }
  zoom.value = 18
  selected.value = location
  service.value = location.service
}

onMounted(async () => {
  loading.value = true
  fetchCurrentLocation()
  locations.value = await pvzListService.addressList()
  loading.value = false
})

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

const handleClose = (done: () => void) => {
  done()
}

const close = () => {
  dialogVisible.value = false
}

const searchListHandle = () => {
  searchDraw.value = !searchDraw.value
}

const myLocationHandle = () => {
  zoom.value = 6
  fetchCurrentLocation()
}

const positionStyle = {
  maxWidth: '360px',
  borderRadius: '24px',
  position: 'absolute',
  top: '-2%',
  left: '1%'
}

// Custom Renderer class for cluster markers
class CustomRenderer implements Renderer {
  render({ count, position }: { count: number; position: google.maps.LatLng | google.maps.LatLngLiteral }) {
    const size = count < 10 ? 53 : count < 100 ? 60 : 70
    const fontSize = count < 10 ? 14 : count < 100 ? 16 : 18

    const svg = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="#044CA2" opacity="0.2"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 6}" fill="#044CA2"/>
        <text x="${size / 2}" y="${size / 2 + 1}" text-anchor="middle" dominant-baseline="middle"
              fill="white" font-size="${fontSize}px" font-weight="bold"
              font-family="Inter, sans-serif">
          ${count}
        </text>
      </svg>
    `

    const icon = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg)

    return new google.maps.Marker({
      position,
      icon: {
        url: icon,
        scaledSize: new google.maps.Size(size, size)
      },
      label: {
        text: String(count),
        color: 'transparent'
      },
      zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count
    })
  }
}

// Cluster options configuration
const clusterOptions = ref({
  renderer: new CustomRenderer(),
  maxZoom: 15,
  gridSize: 60,
  minimumClusterSize: 2
})
</script>

<template>
  <section class="pickup-points">
    <div :class="{ fullMap: !selected, halfMap: selected }" v-loading.fullscreen.lock="loading">
      <div class="back-to-action" @click="router.go(-1)">
        <img :src="LeftIcon" alt="Go back" />
      </div>

      <GoogleMap
        ref="mapRef"
        :api-key="KEY"
        style="width: 100%; height: 100%"
        :center="center"
        :zoom="zoom"
        :libraries="['visualization']"
        :disable-default-ui="true"
        :animation="1"
        :clickable-icons="false"
        :heading="10"
        :min-zoom="6"
        language="en"
      >
        <MarkerCluster :options="clusterOptions">
          <CustomMarker
            v-for="location in locations"
            :key="location.id"
            :options="{ position: { lat: location.latitude, lng: location.longitude } }"
            @click="selectMarker(location)"
          >
            <img
              :style="{ width: serviceSize[location.service] + 'px', height: serviceSize[location.service] + 'px' }"
              :src="serviceLogoOnMap[location.service]"
              :alt="serviceLogoOnMap[location.service]"
            />
          </CustomMarker>
        </MarkerCluster>
      </GoogleMap>

      <!-- Zoom Controls -->
      <div class="zoom-controls">
        <button @click="increaseZoom">
          <img :src="plusSvg" :alt="plusSvg" />
        </button>
        <button @click="decreaseZoom">
          <img :src="minusSvg" :alt="minusSvg" />
        </button>
      </div>

      <!-- Footer Buttons -->
      <div class="footer-button">
        <button @click="searchListHandle">
          <img :src="searchSvg" :alt="searchSvg" />
        </button>
        <button @click="myLocationHandle">
          <img :src="locationSvg" :alt="locationSvg" />
        </button>
      </div>
    </div>

    <!-- Dialog for selected location details -->
    <DynamicDialog v-model="dialogVisible" size="75%" :position-style="positionStyle" :title="t('deliveryPoint')">
      <div class="decInfo">
        <img :src="serviceSvg[selected?.service]" alt="UzPost" />

        <div class="service-info">
          <!-- <h2 :style="{ color: color[service] }" class="service-title">
            {{ serviceTitle[service] }}
          </h2> -->
          <p class="service-address">{{ selected?.fullAddress }}</p>
        </div>

        <div class="working-time">
          <div class="column">
            <h3>{{ t('week.monday') }}-{{ t('week.sunday') }}</h3>
            <h2>09:00-18:00</h2>
          </div>
          <div v-if="selected?.phone" class="column">
            <h3>{{ t('phone') }}</h3>
            <div class="phone-container">
              <a
                v-for="(phone, idx) in selectedPhones"
                :key="idx"
                :href="`tel:${shouldPrefixPlus(phone) ? '+' : ''}${getPhoneDigits(phone)}`"
                @click="handleOpenLinkInTelegram(`tel:${shouldPrefixPlus(phone) ? '+' : ''}${getPhoneDigits(phone)}`)"
              >
                {{ shouldPrefixPlus(phone as any) ? '+' : '' }}{{ formatPhone(phone) }}
              </a>
            </div>
          </div>
          <div v-if="selected?.phoneNumber" class="column">
            <h3>{{ t('phone') }}</h3>
            <div class="phone-container">
              <a
                v-for="(phone, idx) in phoneNumber"
                :key="idx"
                :href="`tel:${shouldPrefixPlus(phone) ? '+' : ''}${getPhoneDigits(phone)}`"
              >
                {{ shouldPrefixPlus(phone) ? '+' : '' }}{{ formatPhone(phone) }}
              </a>
            </div>
          </div>
        </div>

        <div class="price" :style="'border-color:' + color[selected?.service]">
          <div
            class="h-[28px] flex items-center justify-center px-4 rounded-full"
            :style="{ backgroundColor: color[selected?.service] }"
          >
            <span class="text-white text-[16px] tracking-wide font-medium">{{ t('free') }}</span>
          </div>
          <h2>{{ t('deliveryRate') }}</h2>
          <div class="column">
            <h3>{{ t('deliveryNationwide') }}</h3>
          </div>
        </div>

        <!-- Action Button -->
        <el-button class="ok-btn" @click="close">{{ t('translate') }}</el-button>
      </div>
    </DynamicDialog>

    <!-- Search Drawer -->
    <el-drawer
      v-if="searchDraw"
      v-model="searchDraw"
      :direction="direction"
      :before-close="handleClose"
      :fullscreen="true"
      :with-header="false"
      class="search-drawer"
    >
      <SearchList :data="locations" :service="service" @close-sheet="searchListHandle" @selected="selectMarker" />
    </el-drawer>
  </section>
</template>

<style lang="scss">
@mixin f-style($fSize, $fWeight, $color) {
  font-size: $fSize;
  font-weight: $fWeight;
  color: $color;
}

// Cluster markerlarning rangini o'zgartirish
:deep(.gm-style .cluster) {
  background-color: #044ca2 !important;
  border: 3px solid rgba(4, 76, 162, 0.3) !important;
  border-radius: 50% !important;
  color: white !important;
  font-weight: 700 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 2px 8px rgba(4, 76, 162, 0.4) !important;
}

:deep(.gm-style .cluster div) {
  background-color: #044ca2 !important;
  color: white !important;
}

// Google Maps standart cluster rasmlarini o'zgartirish
:deep(.gm-style img[src*='cluster']) {
  filter: hue-rotate(200deg) saturate(150%) brightness(0.9) !important;
}

.fullMap {
  width: 100%;
  height: calc(100vh - 90px);
  position: relative;
  top: 0;
  margin: 0 auto;
}

.back-to-action {
  position: absolute;
  left: 1%;
  top: 2%;
  background-color: #fff;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  z-index: 9;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.service-info {
  display: flex;
  flex-direction: column;
  gap: 6px;

  .service-title {
    font-size: 22px;
    font-weight: 700;
    color: #333;
  }
}

.search-drawer {
  width: 100% !important;
  height: calc(100vh - 88px) !important;
}

.halfMap {
  width: 100%;
  height: calc(100vh - 90px);
  position: relative;
  margin: 0 auto;
  z-index: 10;
}

.pickup-points .el-overlay {
  background-color: transparent !important;
}

.zoom-controls,
.footer-button {
  position: absolute;
  right: 12px;
  top: 50%;
  display: grid;
  gap: 8px;

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
  justify-content: space-between;
  top: 90%;
  right: 0;
  padding: 0 12px;
}

.el-drawer {
  max-width: 580px;
  margin: 0 auto;
  border-radius: var(--Sizes-size-20, 20px) var(--Sizes-size-20, 20px) 0px 0px;
  background: var(--Native-bg_color, #fff);
}

.address-detail-drawer {
  left: 0% !important;
  bottom: 0%;
  height: fit-content !important;
  border-radius: 24px !important;
}

.decInfo {
  img {
    width: 150px;
    object-fit: contain;
    margin-bottom: 20px;
  }

  h2 {
    @include f-style(15px, 600, var(--main-label, #111827));
    line-height: 20px;
    margin-top: 5px;
  }

  .working-time {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;

    .column {
      display: flex;
      width: 100%;
      justify-content: space-between;
      align-items: center;

      h2 {
        @include f-style(15px, 600, var(--main-label, #111827));
      }

      .phone-container {
        @include f-style(15px, 600, var(--main-label, #111827));
        display: flex;
        flex-direction: column;
        gap: 4px;
        align-items: flex-end;
      }

      h3 {
        @include f-style(14px, 500, var(--main-label-secondary, #9ca3af));
      }
    }
  }

  .price {
    border-radius: 16px;
    border: 1px solid var(--gray-200, #e5e7eb);
    display: flex;
    padding: 16px;
    flex-direction: column;
    margin-top: 20px;
    align-items: flex-start;
    gap: 12px;

    .column {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    h3 {
      max-width: 300px;
      line-height: 120%;
      @include f-style(14px, 500, var(--main-label-secondary, #9ca3af));
    }

    h2 {
      line-height: 120%;
      margin: 0;
      @include f-style(14px, 600, var(--main-label, #111827));
    }
  }

  .ok-btn {
    width: 100%;
    height: 48px;
    padding: 0px 24px;
    border: none;
    border-radius: 32px;
    margin-top: 16px;
    background: var(--main-secondary, #111827);
    @include f-style(14px, 500, var(--system-white, var(--Native-bg_color, #fff)));
  }
}

.el-drawer__title {
  @include f-style(16px, 700, var(--main-label, #111827));
}

@media only screen and (max-width: 770px) {
  .fullMap {
    height: 100vh;
  }

  .halfMap {
    height: 100vh;
  }

  .search-drawer {
    height: 100vh !important;
  }

  .back-to-action {
    left: 3%;
    top: 5%;
    width: 45px;
    height: 45px;
  }

  .el-drawer {
    max-width: 95%;
  }

  .address-detail-drawer {
    bottom: 20% !important;
  }
}
</style>
