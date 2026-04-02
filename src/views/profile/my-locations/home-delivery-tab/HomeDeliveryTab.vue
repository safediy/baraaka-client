<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { PersonPvzDTO } from 'types/pvz'
import { ref, watch, computed } from 'vue'
import HomeDeliveryMap from './HomeDeliveryMap.vue'
import DeliveryHomeItem from './DeliveryHomeItem.vue'
import EmptyLocationImage from '@/assets/svg/empty-location.svg'
import DeliveryHomeItemSkeleton from './DeliveryHomeItemSkeleton.vue'
import { useAddPersonPvzMutation } from '@/hooks/mutations/usePvzMutation'

defineOptions({
  name: 'HomeDeliveryTab'
})

const props = defineProps<{
  personPvzData: PersonPvzDTO[] | undefined
  isPersonPvzLoading: boolean
  isLoading: boolean
}>()

const { t } = useI18n()
const homeDeliveryMap = ref()
const selectedId = ref<number | string | null>(null)
const selectedAddress = ref<Pick<PersonPvzDTO, 'id' | 'fullAddress' | 'latitude' | 'longitude' | 'service'> | null>(
  null
)

watch(
  () => props.personPvzData,
  (newData) => {
    if (newData && newData.length > 0) {
      const active = newData.find((item) => item.isSelected)
      if (active) {
        selectedId.value = active.id
        selectedAddress.value = { ...active }
      }
    }
  },
  { immediate: true }
)

const handleItemClick = (item: PersonPvzDTO): void => {
  selectedId.value = item.id
  selectedAddress.value = {
    id: item.id,
    fullAddress: item.fullAddress,
    latitude: item.latitude,
    longitude: item.longitude,
    service: item.service
  }
}

const { mutateAsync, isPending } = useAddPersonPvzMutation()

const handleShowMapDialog = (): void => {
  homeDeliveryMap.value.show()
}

const isButtonDisabled = computed(() => {
  if (!selectedId.value || !props.personPvzData) return true

  const currentInApi = props.personPvzData.find((i) => i.id === selectedId.value)
  return currentInApi?.isSelected === true
})

const handleFinalSubmit = async () => {
  if (!selectedAddress.value) return

  try {
    await mutateAsync(selectedAddress.value)
    ElMessage.success(t('message.success'))
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || t('message.error'))
  }
}
</script>

<template>
  <div class="flex flex-col justify-between h-full">
    <div v-if="isPersonPvzLoading || isPending" class="grid grid-cols-2 gap-2 mt-6 max-md:grid-cols-1">
      <DeliveryHomeItemSkeleton v-for="n in 6" :key="n" />
    </div>

    <template v-else>
      <div
        v-if="personPvzData && personPvzData?.length > 0"
        class="grid grid-cols-2 gap-2 mt-4 max-h-[400px] overflow-y-auto px-1 max-md:grid-cols-1 pb-4 custom-scrollbar max-md:px-0 max-md:max-h-full"
      >
        <DeliveryHomeItem
          v-for="item in personPvzData"
          :key="item.id"
          :item="item"
          :isActive="selectedId === item.id"
          @select="handleItemClick"
        />
      </div>
      <div v-else class="flex h-full w-full flex-col items-center justify-center gap-6 my-6">
        <img :src="EmptyLocationImage" alt="empty" class="w-[128px] h-[128px] object-contain" />

        <p class="text-[#9CA3AF] text-center leading-5 font-medium text-[14px]">{{ t('no.saved.addresses') }}</p>
      </div>
    </template>

    <div
      v-if="isPersonPvzLoading || isPending"
      class="grid grid-cols-2 w-full! gap-2 mt-auto pt-4 border-t border-gray-100"
    >
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="button" class="h-12! w-full! rounded-[12px]!" />
        </template>
      </el-skeleton>
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="button" class="h-12! w-full! rounded-[12px]!" />
        </template>
      </el-skeleton>
    </div>

    <template v-else>
      <div
        class="grid grid-cols-2 w-full! gap-2 mt-auto pt-4 border-t border-gray-100"
        v-if="personPvzData && personPvzData?.length > 0"
      >
        <el-button
          @click="handleShowMapDialog"
          class="uno-text-main text-[15px]! font-medium! border-[#E5E7EB] h-12 w-full rounded-[16px]! hover:bg-[#F9FAFB]! hover:border-[#E5E7EB] max-md:text-[14px]! max-md:h-11!"
        >
          {{ t('add.new') }}
        </el-button>

        <el-button
          type="primary"
          :loading="isLoading"
          :disabled="isButtonDisabled"
          class="uno-dark-btn! h-12! w-full! text-[15px]! disabled:opacity-50! disabled:cursor-not-allowed! rounded-[16px]! max-md:text-[14px]! max-md:h-11!"
          @click="handleFinalSubmit"
        >
          {{ t('select') }}
        </el-button>
      </div>
      <el-button
        v-else
        @click="handleShowMapDialog"
        class="text-white! h-12! w-full! border-none! text-[15px]! bg-[#030712]! rounded-[16px]! max-md:text-[14px]! max-md:h-11! hover:opacity-80"
      >
        {{ t('location.create') }}
      </el-button>
    </template>
  </div>
  <HomeDeliveryMap ref="homeDeliveryMap" />
</template>
