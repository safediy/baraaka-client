<template>
  <el-timeline class="timeline">
    <el-timeline-item
      v-for="(activity, index) in props.activities?.filter((status) => Boolean(status.operateAt))"
      :key="index"
      class="timeline-item"
    >
      <template #dot>
        <img :src="activity.operateAt ? DoneIcon : ProcessIcon" alt="status-icon" style="width: 28px; height: 28px" />
      </template>
      <div class="timeline-content">
        <div class="item-info">
          <el-text tag="span" class="description">{{ t('status.' + activity.status) }}</el-text>
        </div>
        <el-text tag="span" class="date">
          {{ activity?.operateAt ? formatDateTime(activity.operateAt) : t('inProcess') }}
        </el-text>
      </div>
    </el-timeline-item>
  </el-timeline>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue'
const { t } = useI18n()
import DoneIcon from '@/assets/svg/done.svg'
import ProcessIcon from '@/assets/svg/process.svg'
import { formatDateTime } from '@/utils'
import { LogisticType } from 'types/api'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  activities?: LogisticType[]
}>()
</script>

<style lang="scss" scoped>
:deep(.el-timeline-item__wrapper) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  top: 0;
  margin-left: 8px;
  width: 100%;
}

:deep(.el-timeline) {
  width: 100% !important;
}

:deep(.el-timeline-item__tail) {
  top: 6%;
}

:deep(.el-timeline-item__content) {
  width: 100%;
}

:deep(.el-timeline-item__wrapper) {
  width: 100%;
}

.timeline {
  max-width: 600px;
  overflow-y: auto;
  flex-grow: 1;
  // max-height: calc(100vh - 30%);
  // background-color: red;
}

.el-timeline {
  padding-left: 0 !important;
  margin-top: 20px !important;
  width: 100% !important;
  max-width: 100% !important;
}

.timeline-item {
  display: flex;
  align-items: center;
  height: 60px;
}

.timeline-content {
  display: flex;
  justify-content: space-between;
  width: 100% !important;
  align-items: center;
}

:deep(.el-timeline-item__tail) {
  left: 9px !important;
  top: 34.5% !important;
  background: url('../../../assets/svg/divider.svg') no-repeat center;
  background-size: 25px;
  border: none;
  width: 10px;
}
</style>
