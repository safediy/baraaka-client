<script lang="ts" setup>
import { ref, PropType } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { AddressTypesDTO } from 'types/pickupPoints'

defineOptions({
  name: 'SearchList'
})

import EmuLogo from '@/views/map/images/emu.svg?url'
import IpostLogo from '@/assets/service-images/ipost.svg?url'
import StarexLogo from '@/assets/service-images/starex.svg?url'
import RelogLogo from '@/assets/relog.png'
import UzpostLogo from '@/assets/svg/uzPost.svg'
import BtsLogo from '@/assets/service-images/bts.svg'
import { useI18n } from 'vue-i18n'

const serviceSvg: Record<number, string> = {
  1: UzpostLogo,
  2: RelogLogo,
  3: IpostLogo,
  4: EmuLogo,
  5: StarexLogo,
  6: BtsLogo
}

const { t } = useI18n()

const props = defineProps({
  data: {
    type: Array as PropType<AddressTypesDTO[]>,
    default: () => []
  }
})
const emit = defineEmits(['selected', 'closeSheet'])

interface LocationItem {
  address: string
}

const state1 = ref('')

const locationsData = ref(props?.data)

const querySearch = (queryString: string, cb: any) => {
  console.log(queryString)

  locationsData.value =
    queryString || querySearch.length == 0 ? locationsData.value.filter(createFilter(queryString)) : props?.data
  cb([])
}

const createFilter = (queryString: string) => {
  return (location: LocationItem) => {
    return location.address.toLowerCase().indexOf(queryString.toLowerCase()) !== -1
  }
}

const handleSelect = (item: LocationItem) => {
  emit('selected', item)
  console.log(item)
}

const handleToMap = () => {
  emit('closeSheet', false)
}
</script>

<template>
  <div class="search-container">
    <div class="input-container">
      <el-autocomplete
        v-model="state1"
        :fetch-suggestions="querySearch"
        clearable
        class="inline-input w-50"
        :placeholder="t('search')"
        :prefix-icon="Search"
      />
      <div @click="handleToMap">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M18 8C20.3869 8 22.6761 8.94821 24.364 10.636C26.0518 12.3239 27 14.6131 27 17C27 20.074 25.324 22.59 23.558 24.395C22.6757 25.2871 21.7129 26.0958 20.682 26.811L20.256 27.101L20.056 27.234L19.679 27.474L19.343 27.679L18.927 27.921C18.6446 28.0822 18.3251 28.1669 18 28.1669C17.6749 28.1669 17.3554 28.0822 17.073 27.921L16.657 27.679L16.137 27.359L15.945 27.234L15.535 26.961C14.4228 26.2085 13.3869 25.3491 12.442 24.395C10.676 22.589 9 20.074 9 17C9 14.6131 9.94821 12.3239 11.636 10.636C13.3239 8.94821 15.6131 8 18 8ZM18 10C16.1435 10 14.363 10.7375 13.0503 12.0503C11.7375 13.363 11 15.1435 11 17C11 19.322 12.272 21.36 13.871 22.996C14.5585 23.692 15.3017 24.3308 16.093 24.906L16.551 25.232C16.699 25.3353 16.8413 25.4313 16.978 25.52L17.368 25.77L17.711 25.979L18 26.148L18.455 25.879L18.822 25.649C19.0173 25.525 19.2263 25.386 19.449 25.232L19.907 24.906C20.6983 24.3308 21.4415 23.692 22.129 22.996C23.728 21.361 25 19.322 25 17C25 15.1435 24.2625 13.363 22.9497 12.0503C21.637 10.7375 19.8565 10 18 10ZM18 13C19.0609 13 20.0783 13.4214 20.8284 14.1716C21.5786 14.9217 22 15.9391 22 17C22 18.0609 21.5786 19.0783 20.8284 19.8284C20.0783 20.5786 19.0609 21 18 21C16.9391 21 15.9217 20.5786 15.1716 19.8284C14.4214 19.0783 14 18.0609 14 17C14 15.9391 14.4214 14.9217 15.1716 14.1716C15.9217 13.4214 16.9391 13 18 13ZM18 15C17.4696 15 16.9609 15.2107 16.5858 15.5858C16.2107 15.9609 16 16.4696 16 17C16 17.5304 16.2107 18.0391 16.5858 18.4142C16.9609 18.7893 17.4696 19 18 19C18.5304 19 19.0391 18.7893 19.4142 18.4142C19.7893 18.0391 20 17.5304 20 17C20 16.4696 19.7893 15.9609 19.4142 15.5858C19.0391 15.2107 18.5304 15 18 15Z"
            fill="#044CA2"
          />
        </svg>
      </div>
    </div>
    <ul>
      <li v-for="(location, index) in locationsData" :key="index" @click="handleSelect(location)">
        <img style="max-width: 60px; height: 40px" :src="serviceSvg[location.service]" alt="Logo" />
        <div class="text-title">
          <h2>{{ location?.address }}</h2>
        </div>
      </li>
    </ul>
  </div>
</template>

<style lang="scss">
@mixin f-style($fSize, $fWeight, $color) {
  font-size: $fSize;
  font-weight: $fWeight;
  color: $color;
}

.el-autocomplete {
  width: 90%;
  border-radius: 48px;
  height: 100%;
  border: 1px solid #e5e7eb;
}

.search-container {
  background: #fff;

  .input-container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 0.5rem;
  }

  ul {
    margin-top: 20px;
    padding: 0;

    li {
      list-style: none;
      display: flex;
      gap: 12px;
      padding-bottom: 2px;
      border-bottom: 1px solid var(--gray-200, #e5e7eb);
      align-items: center;

      img {
        width: 15%;
        height: auto;
        margin: 10px 0;
      }

      &:nth-last-child(1) {
        border: none;
      }

      .text-title {
        h2 {
          @include f-style(13px, 500, var(--main-label, #111827));
          display: -webkit-box;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      &:active {
        opacity: 0.6;
      }
    }
  }
}

.el-input__wrapper {
  display: flex;
  width: 100%;
  height: 48px;
  padding: 0px 12px;
  align-items: center;
  box-shadow: none;

  border-radius: 48px !important;
  background: var(--gray-100, #f3f4f6);
}

// @media only screen and (max-width: 770px) {
//   .search-container .input-container {
//     padding-top: .5rem;
//   }
// }
</style>
