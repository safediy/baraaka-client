<script setup lang="ts">
import WaybillService from '@/api/WaybillService'
import { ElMessage, FormInstance } from 'element-plus'
import { nextTick, ref, watch } from 'vue'
import AddTrackNumberVideo from '@/assets/videos/AddTrackNumberVideo.mp4'
import { validateTrackingNumbers } from '@/utils'
import { useI18n } from 'vue-i18n'
import CustomSuccessToast from './CustomSuccessToast.vue'
import DynamicDialog from '@/components/DynamicDialog/DynamicDialog.vue'
import { useResponsive } from '@/hooks/useResponsive'
import { eventBus } from '@/utils/eventBus'

const { t } = useI18n()
const { isAbove: isMobile } = useResponsive('md') // true when screen width >= 768px
const dialogVisible = ref<boolean>(false)
const videoDialogVisible = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const successToast = ref()
const videoRef = ref<HTMLVideoElement | null>(null)

const formRef = ref<FormInstance | null>(null)
const formData = ref({ trackingNumber: '' })

const show = () => {
  dialogVisible.value = true
}

const handleAddTrackNumber = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate()
  if (!valid) return

  isLoading.value = true
  try {
    await WaybillService.addTrackNumber(formData.value.trackingNumber.toUpperCase().trim())
    ElMessage.success(t('tracking.addRequestAccepted'))
    eventBus.emit('track-added')
    handleClose()
  } catch (e) {
    ElMessage.error(t('message.addedTrackNumberError'))
  } finally {
    isLoading.value = false
  }
}

const handleClose = () => {
  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.currentTime = 0
  }
  dialogVisible.value = false
  formData.value.trackingNumber = ''
  nextTick(() => {
    formRef.value?.resetFields()
  })
}

const handleOpenVideoDialog = () => {
  videoDialogVisible.value = true
}

watch(videoDialogVisible, (newVal) => {
  if (!newVal && videoRef.value) {
    videoRef.value.pause()
    videoRef.value.currentTime = 0
  }
})

watch(dialogVisible, (newVal) => {
  if (!newVal && videoRef.value) {
    videoRef.value.pause()
    videoRef.value.currentTime = 0
  }
})

const formRules = {
  trackingNumber: [
    {
      required: true,
      message: t('trackingNumber.required'),
      trigger: ['blur', 'change']
    },
    {
      validator: (_rule: any, value: string, callback: any) => {
        if (!value) {
          callback()
          return
        }

        const cleanValue = value.replace(/\s/g, '')

        if (cleanValue.length < 5) {
          callback(new Error(t('tracking.min_length_5')))
        } else {
          callback()
        }
      },
      trigger: ['blur', 'change']
    }
  ]
}

defineExpose({ show })
</script>

<template>
  <DynamicDialog v-model="dialogVisible" :title="t('addTrackNumber')" size="auto">
    <el-form class="add-form" ref="formRef" :model="formData" :rules="formRules" @submit.prevent="handleAddTrackNumber">
      <div class="info-content">
        <el-text type="info" class="info-text" tag="p">{{ t('attention.trackNumber') }}</el-text>
        <el-text style="cursor: pointer" @click="handleOpenVideoDialog" type="primary" tag="p"
          >{{ t('viewGuideVideo') }}
          <el-icon>
            <ArrowRight />
          </el-icon>
        </el-text>
      </div>
      <video v-if="!isMobile" ref="videoRef" class="video-guide" :src="AddTrackNumberVideo" controls autoplay />
      <el-form-item prop="trackingNumber" class="my-0! mb-1!">
        <el-input
          v-model="formData.trackingNumber"
          @input="formData.trackingNumber = formData.trackingNumber.toUpperCase()"
          class="add-input"
          type="text"
          :placeholder="t('trackNumber')"
        />
        <template #error="{ error }">
          <div class="text-[#ff4d4f] text-[13px] h-fit m-0 leading-[140%] mt-1">{{ error }}</div>
        </template>
      </el-form-item>
      <el-text class="text-[12px]! text-[#9ca3af]! mt-1!" tag="span">{{ t('multiple.tracks') }}</el-text>
      <el-button native-type="submit" :loading="isLoading" class="add-button">{{ t('addTrackNumber') }}</el-button>
    </el-form>

    <!-- Video Dialog -->
    <el-dialog
      class="web-video-dialog"
      v-model="videoDialogVisible"
      :title="t('addTrackNumber')"
      top="5vh"
      style="max-width: 366px !important; padding: 10px 14px; border-radius: 24px"
    >
      <video ref="videoRef" class="video" :src="AddTrackNumberVideo" controls autoplay />
    </el-dialog>
    <CustomSuccessToast ref="successToast" />
  </DynamicDialog>
</template>

<style lang="scss" scoped>
@mixin f-style($fSize, $fWeight, $color) {
  font-size: $fSize;
  font-weight: $fWeight;
  color: $color;
}

.add-form .video-guide {
  display: none;
  border-radius: 12px !important;
  overflow: hidden !important;
}

.custom-toast {
  background: #2c2f3b;
  color: #ffffff;
  padding: 16px;
  border-radius: 12px;
}

.toast-title {
  font-weight: bold;
  margin-bottom: 55rem !important;
}

.toast-message {
  font-size: 14px;
}

.info-text {
  line-height: 20px;
  @include f-style(13px, 500, #111827);
  margin-bottom: 5px;
}

.info-content {
  border-radius: 16px;
  background-color: #d81b511a;
  padding: 12px;
  width: 100%;
}

.add-input {
  width: 100%;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding: 0px 0px;
  outline: none;
  height: 48px;
  margin-top: 20px;
  @include f-style(14px, 500, #111827);
}

.video {
  height: auto !important;
  width: 100% !important;
  object-fit: contain;
  border-radius: 16px !important;
  overflow: hidden !important;

  @media screen and (min-width: 770px) {
    height: auto !important;
    width: 100%;
  }
}

.add-button {
  width: 100%;
  border-radius: 16px;
  padding: 0px 16px;
  outline: none;
  border: none;
  height: 48px;
  margin-top: 18px;
  background-color: #030712;
  @include f-style(15px, 500, #fff);
}

:deep(.el-input__wrapper) {
  box-shadow: none;
  outline: none;
  width: 100%;
  border-radius: 16px;
  background: transparent;
}

@media only screen and (max-width: 770px) {
  .info-content {
    display: none;
  }

  .add-form .video-guide {
    display: block;
    height: 300px !important;
    width: 100% !important;
    border-radius: 24px;
    object-fit: contain;
  }

  .add-button {
    border-radius: 32px;
  }
}

@media only screen and (max-width: 480px) {
  .video {
    height: 450px !important;
  }

  .add-input {
    height: 42px;
    margin-top: 10px;
    @include f-style(13px, 500, #111827);
  }

  .add-button {
    height: 42px;
    margin-top: 14px;
    @include f-style(14px, 500, #fff);
  }
}
</style>
