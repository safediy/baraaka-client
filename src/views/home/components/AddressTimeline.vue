<template>
  <el-timeline>
    <el-timeline-item
      v-for="(activity, index) in activitiesReversed"
      :key="index"
      placement="top"
      :timestamp="formatDateTime(activity.change_time)"
      class="cursor-pointer"
    >
      <div class="relative">
        {{ activity.fullAddress || t('address.notAvailable') }}
      </div>
    </el-timeline-item>
  </el-timeline>
</template>

<script lang="ts" setup>
import { defineProps, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatDateTime } from '@/utils'
import type { LocationInfoDTO } from 'types/api'

import RelogLogo from '@/assets/relog.png'
import emuLogo from '@/views/map/images/emu.svg?url'
import IpostLogo from '@/assets/service-images/ipost.svg?url'
import uzPostSvg from '@/views/map/images/uzPost.svg?url'
import StarexLogo from '@/assets/service-images/starex.svg?url'
import TruckLogo from '@/assets/svg/truck-fill.svg?url'

const svg: Record<number, string> = {
  0: TruckLogo,
  1: uzPostSvg,
  2: RelogLogo,
  3: IpostLogo,
  4: emuLogo,
  5: StarexLogo
}

const { t } = useI18n()

const props = defineProps<{
  activities: LocationInfoDTO[]
}>()

console.log('props', props.activities)

const activitiesReversed = computed(() => {
  const arr = [...props.activities]
  // arr.pop()
  // if (arr.length > 1) arr.pop()
  return arr.reverse()
})
</script>

<style lang="scss" scoped>
:deep(.el-timeline-item__wrapper) {
  position: relative;
}
</style>
