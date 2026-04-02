<script setup lang="ts">
import { ref } from 'vue'
import ErrorIcon from '@/assets/svg/error-payment.svg'
import SuccessIcon from '@/assets/svg/success.svg'
import { useI18n } from 'vue-i18n'
import DynamicDialog from '@/components/DynamicDialog/DynamicDialog.vue'

const { t } = useI18n()

const props = defineProps({
  actionType: {
    type: String,
    default: 'error'
  }
})

const svgIcon: Record<string, string> = {
  error: ErrorIcon,
  success: SuccessIcon
}

const errorMessage = ref<string>('')

const drawerVisible = ref<boolean>(false)
const view = (error: any) => {
  console.log('payment error', error.message?.uz)
  errorMessage.value = error.message?.uz
  drawerVisible.value = true
}

const close = () => {
  drawerVisible.value = false
}

defineExpose({
  view,
  close
})
</script>

<template>
  <DynamicDialog v-model="drawerVisible" size="40%" :show-close="false">
    <div class="error-dialog-content">
      <img :src="svgIcon[props.actionType]" alt="Error" />
      <p class="text">{{ errorMessage ?? t('payment.' + props.actionType) }}</p>
      <el-button class="back-btn" @click="close">{{ t('go.back') }}</el-button>
    </div>
  </DynamicDialog>
</template>

<style lang="scss">
@mixin f-style($fSize, $fWeight, $color) {
  font-size: $fSize;
  font-weight: $fWeight;
  color: $color;
}

.error-dialog-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;

  img {
    width: 64px;
    height: 64px;
    object-fit: contain;
  }

  .text {
    @include f-style(16px, 600, #111827);
    line-height: 120%;
    text-align: center;
  }

  .back-btn {
    width: 100%;
    height: 48px;
    border-radius: 32px;
    background-color: #111827;
    @include f-style(14px, 600, #fff);
  }
}

.el-drawer__body {
  overflow: visible !important;
  padding-bottom: 14px !important;
}

.dialog-drawer.el-drawer.btt.open {
  height: fit-content !important;
}

@media only screen and (max-width: 380px) {
  .error-dialog-content {
    gap: 20px;

    img {
      width: 50px;
      height: 50px;
    }

    .text {
      @include f-style(15px, 600, #111827);
      line-height: 120%;
    }

    .back-btn {
      height: 45px;
      border-radius: 32px;
      background-color: #111827;
      @include f-style(13px, 500, #fff);
    }
  }
}
</style>
