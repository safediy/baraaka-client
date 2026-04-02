<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { formatPhone } from '@/utils'
import type { Renderer } from '@googlemaps/markerclusterer'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import pvzListService from '@/api/PvzList'
import { AddressTypesDTO } from 'types/pickupPoints'
import { ref, onMounted, computed } from 'vue'
import personPvzService from '@/api/PersonPvz'
import SearchList from '@/views/map/searchList.vue'
import { useUserStore } from '@/store/modules/user'
import { tashkentDefaultLocation } from '@/constants/api'
import { GoogleMap, MarkerCluster, CustomMarker } from 'vue3-google-map'
import { getSessianStorage, removeSessianStorage } from '@/utils/cache/cookies'

import plusSvg from '@/views/map/images/plus.svg?url'
import minusSvg from '@/views/map/images/minus.svg?url'
import searchSvg from '@/views/map/images/search.svg?url'
import locationSvg from '@/views/map/images/location.svg?url'
import { ENV } from '@/config/env'
import { SERVICES } from '@/constants/services'

defineOptions({
  name: 'MapScreen'
})

const KEY = ENV.GOOGLE_API_KEY
const { t } = useI18n()
const router = useRouter()
const telegramService = window.Telegram
telegramService.WebApp.ready()

const zoom = ref<number>(12)
const service = ref<number>(0)
const locations: any = ref([])
const selected: any = ref(null)
const loading = ref<boolean>(false)
const searchDraw = ref<boolean>(false)
const drawerVisible = ref<boolean>(false)
const center = ref({ ...tashkentDefaultLocation, timestamp: 0 })

const handleOpenLinkInTelegram = (phone: string) => {
  if (telegramService.WebApp.initData) {
    telegramService.WebApp.openLink(phone)
  }
}
const mapRef = ref(null)
const selectedPhones = computed<string[]>(() => {
  const raw = selected.value?.phone ?? ''
  return raw
    .split(',')
    .map((p: string) => p.trim())
    .filter((p: string) => p.length > 0)
})
const getPhoneDigits = (phone: string): string => phone?.replace(/\D/g, '') ?? ''
const shouldPrefixPlus = (phone: string): boolean => getPhoneDigits(phone).length >= 11

const fetchCurrentLocation = async () => {
  loading.value = true
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        center.value = Object.assign({ lat: latitude, lng: longitude, timestamp: position.timestamp })
        zoom.value = 13
      },
      (error) => {
        console.error('Error getting current location:', error)
        center.value = Object.assign({ ...tashkentDefaultLocation, timestamp: '' })
      }
    )
  } else {
    console.error('Geolocation is not supported by this browser.')
  }
  loading.value = false
}

const userStore = useUserStore()

const selectMarker = (location: AddressTypesDTO) => {
  drawerVisible.value = true
  service.value = location.service
  searchDraw.value = false
  zoom.value = 0
  center.value = { lat: location.latitude, lng: location.longitude, timestamp: Date.now() }
  zoom.value = 18
  service.value = location.service
  selected.value = location
}

// Fetch data on component mount
onMounted(async () => {
  loading.value = true

  fetchCurrentLocation()

  locations.value = await pvzListService.addressList()
  locations.value.uzPost = locations.value

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

const direction = ref<any['direction']>('btt')

const handleClose = (done: () => void) => {
  // done()
  drawerVisible.value = false
}

const handleCloseChange = () => {
  selected.value = false
  drawerVisible.value = false
}

const handleSubmit = async () => {
  const trackingNumber = getSessianStorage('trackingNumber')

  loading.value = true
  try {
    await personPvzService.addPersonPvz({ ...selected.value, trackingNumber }).then(() => {
      ElMessage.success(t('successfully.added'))
      zoom.value = 13
      router.push('/serviceMap')
      // telegramService.WtelebApp?.close()
    })
  } catch (error: any) {
    ElMessage.error(error)
  } finally {
    drawerVisible.value = false
    loading.value = false
    removeSessianStorage('trackingNumber')
    userStore.getInfo()
  }
}

const searchListHandle = () => {
  searchDraw.value = !searchDraw.value
}

const myLocationHandle = () => {
  zoom.value = 6
  fetchCurrentLocation()
}

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
  <div :class="{ fullMap: !drawerVisible, halfMap: drawerVisible }" v-loading.fullscreen.lock="loading">
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
          :class="{ activePvz: location?.id === userStore.pvzInfo?.id }"
          @click="selectMarker(location)"
        >
          <img
            :style="{ width: SERVICES[location.service]?.size + 'px', height: SERVICES[location.service]?.size + 'px' }"
            :src="SERVICES[location.service]?.mapLogo"
            :alt="location.service"
          />
        </CustomMarker>
      </MarkerCluster>
    </GoogleMap>
    <!-- <div class="head-tab">
      <div class="button-group">
        <button class="btn-service" :class="{ on: service == 2 }" @click="changeService(2)">
          Abusahiy <span>Bepul</span>
        </button>
        <button class="btn-service" :class="{ on: service == 1 }" @click="changeService(1)">EMU</button>
      </div>
    </div> -->
    <div class="zoom-controls">
      <button @click="increaseZoom">
        <img :src="plusSvg" :alt="plusSvg" />
      </button>
      <button @click="decreaseZoom">
        <img :src="minusSvg" :alt="minusSvg" />
      </button>
    </div>

    <div class="footer-button">
      <button @click="searchListHandle">
        <img :src="searchSvg" :alt="searchSvg" />
      </button>
      <button @click="myLocationHandle">
        <img :src="locationSvg" :alt="locationSvg" />
      </button>
    </div>
  </div>
  <el-drawer
    style="padding: 0 20px 10px"
    v-model="drawerVisible"
    :title="t('deliveryPoint')"
    :direction="direction"
    :before-close="handleClose"
    :fullscreen="true"
    :modal="false"
    size="570px"
  >
    <div class="decInfo">
      <div>
        <img :src="SERVICES[selected.service]?.logo" alt="UzPost" />
        <div class="service-info">
          <!-- <h2 class="service-title">{{ serviceTitle[service] }}</h2> -->
          <p class="service-address">{{ selected.fullAddress }}</p>
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
                @click="
                  () => handleOpenLinkInTelegram(`tel:${shouldPrefixPlus(phone) ? '+' : ''}${getPhoneDigits(phone)}`)
                "
                v-for="(phone, idx) in selectedPhones"
                :key="idx"
                :href="`tel:${shouldPrefixPlus(phone) ? '+' : ''}${getPhoneDigits(phone)}`"
              >
                {{ shouldPrefixPlus(phone) ? '+' : '' }}{{ formatPhone(phone) }}
              </a>
            </div>
          </div>
        </div>
        <div class="price" :style="'border-color:' + SERVICES[selected?.service]?.color">
          <div
            class="h-[28px] flex items-center justify-center px-4 rounded-full"
            :style="{ backgroundColor: SERVICES[selected?.service]?.color }"
          >
            <span class="text-white text-[16px] tracking-wide font-medium">{{ t('free') }}</span>
          </div>
          <!-- <svg width="71" height="28" viewBox="0 0 71 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="71" height="28" rx="14" :fill="color[3]" />
            <path
              d="M13.425 19V8.5H18.015C20.58 8.5 21.885 9.37 21.885 11.095C21.885 12.535 20.955 13.45 19.305 13.585V13.615C21.135 13.72 22.185 14.665 22.185 16.24C22.185 18.07 20.79 19 18.06 19H13.425ZM17.7 12.985C19.125 12.985 19.92 12.415 19.92 11.41C19.92 10.465 19.26 10.045 17.745 10.045H15.345V12.985H17.7ZM15.345 17.455H17.715C19.47 17.455 20.19 17.005 20.19 15.91C20.19 14.845 19.5 14.44 17.715 14.44H15.345V17.455ZM28.5911 19.21C25.6661 19.21 23.9561 17.515 23.9561 15.115C23.9561 12.685 25.6661 11.035 28.2611 11.035C30.9161 11.035 32.3861 12.64 32.3861 15.19L25.9511 16.075C26.2811 17.095 27.1661 17.665 28.7111 17.665C29.7461 17.665 30.7811 17.44 31.8161 17.065V18.625C30.8411 19 29.8961 19.21 28.5911 19.21ZM25.8161 15.04L30.5861 14.38C30.4511 13.195 29.6861 12.58 28.3061 12.58C26.6711 12.58 25.8311 13.45 25.8161 15.04ZM34.2645 22V11.245H36.0795L35.8695 13.495H35.8995C36.3645 11.965 37.6545 11.035 39.3495 11.035C41.5845 11.035 43.1445 12.685 43.1445 15.07C43.1445 17.53 41.3895 19.21 38.8545 19.21C37.7895 19.21 36.9195 18.91 36.0795 18.25V22H34.2645ZM38.6895 17.635C40.3245 17.635 41.2845 16.705 41.2845 15.115C41.2845 13.54 40.3245 12.61 38.6895 12.61C37.0395 12.61 36.0795 13.54 36.0795 15.115C36.0795 16.705 37.0395 17.635 38.6895 17.635ZM48.2246 19.21C46.2146 19.21 45.0896 17.98 45.0896 15.655V11.245H46.9046V15.43C46.9046 16.885 47.6396 17.635 48.9746 17.635C50.4296 17.635 51.3446 16.675 51.3446 15.235V11.245H53.1596V19H51.3446L51.5546 16.75H51.5246C51.1046 18.31 49.9196 19.21 48.2246 19.21ZM55.5633 19V8.5L57.3783 8.155V19H55.5633Z"
              fill="white" />
          </svg> -->

          <h2>{{ t('deliveryRate') }}</h2>
          <!-- <div class="column">
            <h3>1KG gacha bo’lgan yuk uchun yetkazish narxi</h3>
            <h2>30 000 so’m</h2>
          </div>
          <div class="column">
            <h3>Qo’shimcha har 0.5KG yuk uchun</h3>
            <h2>10 000 so’m</h2>
          </div> -->
          <div class="column">
            <h3>{{ t('deliveryNationwide') }}</h3>
          </div>
        </div>
      </div>
      <!-- btn -->
      <div class="btn-group">
        <el-button class="btn" @click="handleCloseChange">{{ t('other') }}</el-button>
        <el-button class="btn" @click="handleSubmit" :loading="loading">{{ t('select') }}</el-button>
      </div>
    </div>
  </el-drawer>

  <el-drawer
    v-model="searchDraw"
    title="Search"
    :direction="direction"
    :before-close="handleClose"
    :fullscreen="true"
    :modal="false"
    :with-header="false"
    size="100%"
    v-if="searchDraw"
  >
    <SearchList :data="locations" :service @close-sheet="searchListHandle" @selected="selectMarker" />
  </el-drawer>
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
  /* width: 100%; */
  max-width: 600px;
  height: 100%;
  position: relative;
  margin: 0 auto;
}

.halfMap {
  max-width: 600px;
  height: 58%;
  position: relative;
  margin: 0 auto;
}

.head-tab {
  position: absolute;
  top: 25px;
  width: 100%;
  display: flex;
  justify-content: center;

  .button-group {
    margin: 0 auto;
    background-color: #fff;
    padding: 3px;
    border-radius: 14px;

    .btn-service {
      color: var(--system-white, var(--Native-bg_color, #fff));
      /* footnote/semibold */
      font-size: 13px;
      font-style: normal;
      font-weight: 600;

      background: #fff;
      background: transparent;
      color: #044ca2;
      border: none;
      font-size: 14px;
      border-radius: 12px;
      padding: 6px 22px;
      padding-top: 8px;
    }

    .on {
      background-color: #044ca2;
      color: #fff;
      box-shadow: 0px 3px 8px 0px #1118270d;

      span {
        background-color: #fff;
        color: #044ca2;
      }
    }

    span {
      background: #044ca2;
      color: #fff;
      padding: 2px 8px;
      padding-top: 4px;
      border-radius: 32px;
      font-size: 11px;
    }
  }
}

.service-info {
  display: flex;
  flex-direction: column;
  gap: 6px;

  .service-title {
    font-size: 16px;
    font-weight: 700;
    color: #333;
  }
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

/* .search-location-button {
  left: 12px;
} */

.el-drawer {
  max-width: 580px;
  margin: 0 auto;
  /* height: 54% !important; */
  border-radius: var(--Sizes-size-20, 20px) var(--Sizes-size-20, 20px) 0px 0px;
  background: var(--Native-bg_color, #fff);
}

.decInfo {
  box-sizing: border-box;
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-between;

  img {
    width: 130px;
    object-fit: contain;
    margin-bottom: 20px;
  }

  h2 {
    color: var(--main-label, #111827);
    /* callout/semibold */

    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: 120%;
    margin-top: 10px;
    /* 19.2px */
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
    align-items: flex-start;
    /* gap: 12px; */
    align-self: stretch;
    gap: 12px;
    margin-top: 16px;

    .free {
      // display: flex;
      height: 20px;
      padding: 0px 8px;
      justify-content: center;
      align-items: center;

      border-radius: 32px;
      background: var(--main-primary, #044ca2);

      color: var(--system-white, var(--Native-bg_color, #fff));

      /* caption1/semibold */
      font-size: 12px;
      font-style: normal;
      font-weight: 600;
      line-height: 120%;
      /* 14.4px */
    }

    .column {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    h3 {
      color: var(--main-label-secondary, #9ca3af);
      width: 60%;
      /* subheadline/medium */
      font-size: 13px;
      font-style: normal;
      font-weight: 500;
      line-height: 120%;
      /* 18px */
      margin: 0;
    }

    h2 {
      color: var(--main-label, #111827);

      /* subheadline/semibold */
      font-size: 15px;
      font-style: normal;
      font-weight: 600;
      line-height: 120%;
      /* 18px */
      margin: 0;
    }
  }

  .btn-group {
    display: flex;
    margin-top: 1em;
    gap: 8px;

    .btn {
      width: 50%;
      height: 48px;
      height: 48px;
      padding: 0px 24px;
      border: none;

      border-radius: 32px;

      background: var(--main-secondary, #111827);

      color: var(--system-white, var(--Native-bg_color, #fff));
      text-align: center;

      /* subheadline1/semibold */
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
      line-height: 120%;
      /* 16.8px */

      &:nth-child(1) {
        background: var(--gray-100, #f3f4f6);
        color: var(--main-label, #111827);
      }
    }
  }
}

.el-drawer__title {
  color: var(--main-label, #111827);
  /* callout/bold */
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 120%;
  /* 19.2px */
}
</style>
