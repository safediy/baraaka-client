<script lang="ts" setup>
import AlertIcon from '@/assets/svg/alert-success.svg'
import { useI18n } from 'vue-i18n'
import { PersonPvzDTO } from 'types/pvz'
import EmptyPunktImg from '@/assets/empty-punkt.png'
import PickupPointCardItem from './PickupPointCardItem.vue'
import PickupPointCardItemSkeleton from './PickupPointCardItemSkeleton.vue'
import { computed, ref, watch } from 'vue'
import PickupPointMap from './PickupPointMap.vue'
import { ElMessage } from 'element-plus'
import { useAddPersonPvzMutation } from '@/hooks/mutations/usePvzMutation'

const { t } = useI18n()

const props = defineProps<{
  personPvzData: PersonPvzDTO[] | undefined
  isPersonPvzLoading: boolean
  handleDeleteLocation: (item: PersonPvzDTO) => void
}>()

const { mutateAsync, isPending } = useAddPersonPvzMutation()

const pickupPointMapDialog = ref()
const selectedId = ref<number | string | null>(null)
const selectedAddress = ref<Pick<PersonPvzDTO, 'id' | 'fullAddress' | 'latitude' | 'longitude' | 'service'> | null>(
  null
)

const handleShowMapDialog = () => {
  pickupPointMapDialog.value?.show()
}

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

const isButtonDisabled = computed(() => {
  if (!selectedId.value || !props.personPvzData) return true

  const currentInApi = props.personPvzData.find((i) => i.id === selectedId.value)
  return currentInApi?.isSelected === true
})

const handleItemClick = (item: PersonPvzDTO) => {
  selectedId.value = item.id
  selectedAddress.value = {
    id: item.id,
    fullAddress: item.fullAddress,
    latitude: item.latitude,
    longitude: item.longitude,
    service: item.service
  }
}

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
  <div class="flex flex-col justify-between h-full w-full pt-0">
    <div
      class="w-full border border-[#25a12f1a] bg-[#25a12f1a] rounded-[16px] p-3 flex items-center gap-2 mb-[14px] max-md:p-2.5 max-md:mb-2"
    >
      <img :src="AlertIcon" class="w-5 h-5" />
      <p class="text-[13px] text-[#6b7280] leading-4.5 text-left">{{ t('free.delivery.all.points') }}</p>
    </div>

    <div
      class="w-full flex flex-col items-start h-full justify-start gap-2 py-0 px-2.5 overflow-y-auto max-h-[340px] pb-2.5 max-md:px-0 max-md:py-0"
    >
      <template v-if="isPersonPvzLoading">
        <pickup-point-card-item-skeleton v-for="n in 3" :key="n" />
      </template>

      <template v-else-if="personPvzData && personPvzData?.length > 0">
        <pickup-point-card-item
          v-for="item in personPvzData"
          :key="item.id"
          :item="item"
          :isActive="selectedId === item.id"
          :handleDeleteLocation="handleDeleteLocation"
          @select="handleItemClick"
        />
      </template>

      <div v-else class="w-full mt-6 flex flex-col justify-center items-center gap-6 grow py-10">
        <img :src="EmptyPunktImg" class="w-[128px] h-[128px] object-contain" />
        <p class="text-[14px] font-medium text-[#9ca3af] max-w-[240px] leading-5 text-center">
          {{ t('no.saved.points') }}
        </p>
      </div>
    </div>

    <div class="flex justify-center gap-2 mt-6">
      <template v-if="isPersonPvzLoading || isPending">
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
      </template>
      <template v-else>
        <div v-if="personPvzData && personPvzData.length > 0" class="flex items-center justify-center gap-2 w-full">
          <el-button
            @click="handleShowMapDialog"
            class="uno-text-main text-[15px]! font-medium! border-[#E5E7EB] h-12 w-full rounded-[16px]! hover:bg-[#F9FAFB]! hover:border-[#E5E7EB] max-md:text-[14px]! max-md:h-11!"
          >
            {{ t('add.point') }}
          </el-button>
          <el-button
            @click="handleFinalSubmit"
            :loading="isPending"
            :disabled="isButtonDisabled"
            class="bg-[#030712]! text-white! text-[15px]! h-12! rounded-[16px]! h-12 w-full border-none! hover:opacity-80 max-md:text-[14px]! max-md:h-11!"
          >
            <span class="block max-md:hidden">
              {{ t('select.this.point') }}
            </span>
            <span class="hidden max-md:block">
              {{ t('select') }}
            </span>
          </el-button>
        </div>
        <el-button
          v-else
          @click="handleShowMapDialog"
          class="text-white! h-12! w-full! border-none! text-[15px]! bg-[#030712]! rounded-[16px]! max-md:text-[14px]! max-md:h-11! hover:opacity-80"
        >
          {{ t('add.new') }}
        </el-button>
      </template>
    </div>
  </div>
  <pickup-point-map ref="pickupPointMapDialog" />
</template>
