<script lang="ts" setup>
import { ENV } from '@/config/env'
import { useI18n } from 'vue-i18n'
import { formatPhone } from '@/utils'
import pvzListService from '@/api/PvzList'
import { ref, onMounted, computed } from 'vue'
import { SERVICES } from '@/constants/services'
import SearchList from '@/views/map/searchList.vue'
import { useUserStore } from '@/store/modules/user'
import { AddressTypesDTO } from 'types/pickupPoints'
import { DrawerProps, ElMessage } from 'element-plus'
import type { Renderer } from '@googlemaps/markerclusterer'
import { tashkentDefaultLocation } from '@/constants/api'
import { GoogleMap, MarkerCluster, CustomMarker } from 'vue3-google-map'
import { useAddPersonPvzMutation } from '@/hooks/mutations/usePvzMutation'

import plusSvg from '@/views/map/images/plus.svg?url'
import minusSvg from '@/views/map/images/minus.svg?url'
import searchSvg from '@/views/map/images/search.svg?url'
import locationSvg from '@/views/map/images/location.svg?url'
import DynamicDialog from '@/components/DynamicDialog/DynamicDialog.vue'

defineOptions({
  name: 'MapScreen'
})

const KEY = ENV.GOOGLE_API_KEY
const { t } = useI18n()
const telegramService = window.Telegram
telegramService.WebApp.ready()
const userStore = useUserStore()

const zoom = ref<number>(12)
const service = ref<number>(0)
const locations: any = ref([])
const loading = ref<boolean>(false)
const searchDraw = ref<boolean>(false)
const drawerVisible = ref<boolean>(false)
const dialogVisible = ref<boolean>(false)
const selected = ref<AddressTypesDTO | null>(null)
const direction = ref<DrawerProps['direction']>('btt')
const center = ref({ ...tashkentDefaultLocation, timestamp: 0 })

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

const show = () => {
  dialogVisible.value = true
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

const handleClose = (done: () => void) => {
  // done()
  drawerVisible.value = false
}

const handleCloseChange = () => {
  selected.value = null
  drawerVisible.value = false
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

const { mutateAsync, isPending } = useAddPersonPvzMutation()
const centerValue = ref<any>(null)

const handleConfirm = async () => {
  if (!selected.value) return

  try {
    await mutateAsync(selected.value)
    dialogVisible.value = false
    drawerVisible.value = false
    centerValue.value = null
    zoom.value = 13
    ElMessage.success(t('successfully.added'))
  } catch (error: any) {
    console.error('Saqlashda xatolik:', error)
    ElMessage.error(error?.response?.data?.message || t('message.error'))
  }
}

const closeMapDialog = () => {
  centerValue.value = null
  dialogVisible.value = false
}

const getPhoneDigits = (phone: string): string => phone?.replace(/\D/g, '') ?? ''
const shouldPrefixPlus = (phone: string): boolean => getPhoneDigits(phone).length >= 11
const selectedPhones = computed<string[]>(() => {
  const raw = selected.value?.phone ?? ''
  return raw
    .split(',')
    .map((p: string) => p.trim())
    .filter((p: string) => p.length > 0)
})

const handleOpenLinkInTelegram = (phone: string) => {
  if (telegramService.WebApp.initData) {
    telegramService.WebApp.openLink(phone)
  }
}

const formattedWorkTime = computed(() => {
  const raw = (selected.value as any)?.workTime
  if (!raw) return []

  const daysMap: Record<string, string> = {
    '1': 'monday',
    '2': 'tuesday',
    '3': 'wednesday',
    '4': 'thursday',
    '5': 'friday',
    '6': 'saturday',
    '7': 'sunday'
  }

  if (Array.isArray(raw) && typeof raw[0] === 'object' && raw[0] !== null) {
    return raw.map((item: any) => ({
      day: item.day.toLowerCase(),
      time: item.time || t('restDay')
    }))
  }

  return Object.entries(raw).map(([dayKey, time]) => ({
    day: daysMap[dayKey] || dayKey,
    time: time && time !== 'null' ? time : t('restDay')
  }))
})

const isToday = (dayName: string) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return days[new Date().getDay()] === dayName.toLowerCase()
}

const currentDayTime = computed(() => {
  const today = formattedWorkTime.value.find((item) => isToday(item.day))
  return today ? today.time : t('restDay')
})

onMounted(async () => {
  loading.value = true

  fetchCurrentLocation()

  locations.value = await pvzListService.addressList()
  locations.value.uzPost = locations.value

  loading.value = false
})

defineExpose({ show })

const positionStyle = {
  maxWidth: '1200px',
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
    <div class="map-container relative w-full h-[540px] rounded-[16px]! overflow-hidden max-md:h-[500px]">
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
              :style="{
                width: SERVICES[location.service]?.size + 'px',
                height: SERVICES[location.service]?.size + 'px'
              }"
              :src="SERVICES[location.service]?.mapLogo"
              :alt="location.service"
            />
          </CustomMarker>
        </MarkerCluster>
      </GoogleMap>

      <div class="absolute right-2 bottom-[5%] grid gap-2">
        <button
          class="bg-white border-none text-[28px] flex items-center justify-center w-12 h-12 rounded-full overflow-hidden cursor-pointer active:opacity-80 shadow-md"
          @click="increaseZoom"
        >
          <img :src="plusSvg" :alt="plusSvg" />
        </button>

        <button
          class="bg-white border-none text-[28px] flex items-center justify-center w-12 h-12 rounded-full overflow-hidden cursor-pointer active:opacity-80 shadow-md"
          @click="decreaseZoom"
        >
          <img :src="minusSvg" :alt="minusSvg" />
        </button>

        <button
          class="bg-white border-none text-[28px] flex items-center justify-center w-12 h-12 rounded-full overflow-hidden cursor-pointer active:opacity-80 shadow-md"
          @click="myLocationHandle"
        >
          <img :src="locationSvg" :alt="locationSvg" />
        </button>
      </div>
      <button
        @click="searchListHandle"
        class="bg-white absolute left-2 z-999 bottom-[6%] border-none text-[28px] flex items-center justify-center w-12 h-12 rounded-full overflow-hidden cursor-pointer active:opacity-80 shadow-md"
      >
        <img :src="searchSvg" :alt="searchSvg" />
      </button>
    </div>
    <div class="flex mt-6 gap-2">
      <el-button class="w-full! h-12 rounded-[16px]! text-[15px]! font-medium! text-[#111827]!" @click="closeMapDialog">
        {{ t('cancel') }}
      </el-button>
      <!-- <el-button :loading="isPending"
        class="w-full! h-12 rounded-[16px]! text-[15px]! font-medium! text-white! bg-[#030712]!"
        :disabled="!centerValue" @click="handleConfirm">
        {{ isEdit ? t('save') : t('save.address') }}
      </el-button> -->
    </div>

    <!-- SELECTED DIALOG -->
    <el-dialog
      class="bg-white! rounded-[16px]! h-fit! p-6! pt-0! max-w-[500px]! w-full!"
      top="5vh"
      v-model="drawerVisible"
      :title="t('deliveryPoint')"
    >
      <div class="decInfo">
        <div v-if="selected?.service">
          <img :src="SERVICES[selected?.service]?.logo" alt="UzPost" />
          <div class="service-info">
            <p class="service-address text-[14px] font-normal leading-[120%]">{{ selected?.fullAddress }}</p>
          </div>
          <div class="working-time">
            <div class="work-time-container">
              <el-collapse accordion class="border-none!">
                <el-collapse-item name="1">
                  <template #title>
                    <div class="flex items-center gap-2">
                      <el-icon class="text-blue-500">
                        <Clock />
                      </el-icon>
                      <span class="font-medium text-[14px]"> {{ t('workTime') }}: {{ currentDayTime }} </span>
                    </div>
                  </template>

                  <div class="pl-6 flex flex-col gap-1">
                    <div
                      v-for="item in formattedWorkTime"
                      :key="item.day"
                      class="flex justify-between text-[13px]"
                      :class="{ 'text-blue-600 font-bold': isToday(item.day) }"
                    >
                      <span class="text-gray-500">{{ t(`week.${item.day}`) }}</span>
                      <span :class="item.time === t('restDay') ? 'text-red-400' : 'text-gray-700'">
                        {{ item.time }}
                      </span>
                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
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
            <h2>{{ t('deliveryRate') }}</h2>
            <div class="column">
              <h3>{{ t('deliveryNationwide') }}</h3>
            </div>
          </div>
        </div>
        <!-- btn -->
        <div class="flex items-center justify-between gap-2 mt-5">
          <el-button
            class="uno-text-main text-[15px]! font-medium! border-[#E5E7EB] h-12 w-full rounded-[16px]! hover:bg-[#F9FAFB]! hover:border-[#E5E7EB] max-md:text-[14px]! max-md:h-11!"
            @click="handleCloseChange"
            >{{ t('other') }}</el-button
          >
          <el-button
            class="bg-[#030712]! text-white! text-[15px]! h-12! rounded-[16px]! h-12 w-full border-none! hover:opacity-80 max-md:text-[14px]! max-md:h-11!"
            @click="handleConfirm"
            :loading="isPending"
            >{{ t('select') }}</el-button
          >
        </div>
      </div>
    </el-dialog>

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
  </DynamicDialog>
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
