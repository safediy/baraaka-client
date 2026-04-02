<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { CircleCheckFilled } from '@element-plus/icons-vue'

const { t } = useI18n()
const isVisible = ref(false)
let autoCloseTimer: ReturnType<typeof setTimeout> | null = null

const show = () => {
  isVisible.value = true

  if (autoCloseTimer) clearTimeout(autoCloseTimer)

  autoCloseTimer = setTimeout(() => {
    close()
  }, 2000)
}

const close = () => {
  isVisible.value = false
  if (autoCloseTimer) clearTimeout(autoCloseTimer)
}

defineExpose({ show })
</script>

<template>
  <el-dialog
    v-model="isVisible"
    :show-close="false"
    align-center
    class="success-rating-dialog rounded-[32px]!"
    width="400px"
    append-to-body
  >
    <div class="flex flex-col items-center justify-center py-6 px-4">
      <div class="w-20 h-20 bg-[#ECFDF5] rounded-full flex items-center justify-center">
        <el-icon class="text-[48px] text-[#10B981]">
          <CircleCheckFilled />
        </el-icon>
      </div>

      <h2 class="text-[24px] font-bold text-[#111827] mt-6 mb-2">
        {{ t('rating.thanks') }}
      </h2>

      <p class="text-center text-[16px] text-[#6B7280] leading-6 max-w-[300px]">
        {{ t('rating.success_message') }}
      </p>

      <el-button
        type="primary"
        class="w-full h-13! bg-[#044CA2]! border-none! rounded-[12px]! text-[16px]! font-600! mt-8 transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5"
        @click="close"
      >
        {{ t('close') }}
      </el-button>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.success-rating-dialog {
  :deep(.el-dialog) {
    overflow: hidden;
  }

  :deep(.el-dialog__header) {
    display: none;
  }
}
</style>
