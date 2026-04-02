<script lang="ts" setup>
import { PropType, ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

defineOptions({
  name: 'SearchList'
})

const { t } = useI18n()

import { AddressTypesDTO } from 'types/pickupPoints'
import { useI18n } from 'vue-i18n'
import { SERVICES } from '@/constants/services'

const props = defineProps({
  data: {
    type: Array as PropType<AddressTypesDTO[]>,
    default: () => []
  },
  service: {
    type: Number
  }
})
const emit = defineEmits(['selected', 'closeSheet'])

const state1 = ref('')

const locationsData = ref<any[]>(props?.data)

const querySearch = (queryString: string, cb: any) => {
  const normalized = (queryString || '').trim().toLowerCase()
  if (!normalized) {
    locationsData.value = props?.data || []
    cb([])
    return
  }

  const filterFn = createFilter(normalized)
  locationsData.value = (props?.data || []).filter(filterFn)
  cb([])
}

const createFilter = (normalizedQuery: string) => {
  return (location: any) => {
    const address = String(location?.address || '').toLowerCase()
    const fullAddress = String(location?.fullAddress || '').toLowerCase()
    return address.includes(normalizedQuery) || fullAddress.includes(normalizedQuery)
  }
}

const handleSelect = (item: AddressTypesDTO) => {
  emit('selected', item)
  console.log(item)
}

const handleToMap = () => {
  emit('closeSheet', false)
}
</script>

<template>
  <div class="bg-white h-[80vh] z-999! p-2.5 max-md:h-[88vh]">
    <div class="flex items-center justify-between w-full">
      <div @click="handleToMap" class="cursor-pointer">
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M30 19H8M8 19L15 26M8 19L15 12"
            stroke="#044CA2"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <el-autocomplete
        v-model="state1"
        :fetch-suggestions="querySearch"
        clearable
        autofocus
        class="inline-input"
        :placeholder="t('search')"
        :prefix-icon="Search"
      />
    </div>
    <ul class="mt-4 p-2.5 h-full overflow-y-auto">
      <li
        v-for="location in locationsData"
        :key="location?.zip"
        @click="handleSelect(location)"
        class="list-none flex items-center gap-3 pb-0.5 border-b-solid! border-b! border-gray-200"
      >
        <img
          class="w-14 h-14 object-contain my-2.5"
          style="max-width: 60px; height: 40px"
          :src="SERVICES[location.service]?.logo"
          alt="Logo"
        />
        <div class="text-title">
          <p class="uno-text-main text-[13px] font-medium leading-[120%] line-clamp-2 overflow-hidden text-ellipsis">
            {{ location?.fullAddress ?? location?.address }}
          </p>
        </div>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-autocomplete) {
  width: 100% !important;
}

:deep(.el-input__wrapper) {
  display: flex;
  width: 100% !important;
  height: 36px;
  padding: 0px 12px;
  align-items: center;
  box-shadow: none;

  border-radius: 32px;
  background: var(--gray-100, #f3f4f6);
}
</style>
