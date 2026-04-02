<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import PinduoduoIcon from '@/assets/pinduoduo.jpg'
import SecondAppIcon from '@/assets/1688app.png'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import DOMPurify from 'dompurify'
import AppPinduoduoVideo from '@/assets/videos/PinduoduoVideo.mp4'
import App1688Video from '@/assets/videos/1688Video.mp4'
import DynamicDialog from '@/components/DynamicDialog/DynamicDialog.vue'
import { useGetChinaAddress } from '@/hooks/queries/useClientQuery'

const { t } = useI18n()

const dialogVisible = ref<boolean>(false)
const videoDialogVisible = ref<boolean>(false)

const videoDialogTitle = ref('')
const guideVideo = ref('')
const videoRef = ref<HTMLVideoElement | null>(null)

const { data, isLoading } = useGetChinaAddress({
  enabled: dialogVisible
})

const addressAvailable = computed(() => !!data.value)

const address = computed(() => data.value?.address || '')
const postalCode = computed(() => {
  if (!data.value?.postalCode) return ''
  return data.value.postalCode.slice(12)
})

const show = () => {
  dialogVisible.value = true
}

const CopyPostcode = async (type: string) => {
  const textToCopy = type === 'postcode' ? data.value?.postalCode : data.value?.address
  const message = type === 'postcode' ? t('message.copiedPostalCode') : t('message.copiedAddress')

  if (textToCopy) {
    const cleanCode = DOMPurify.sanitize(textToCopy, { ALLOWED_TAGS: [] })
    await navigator.clipboard.writeText(cleanCode)
    ElMessage.success(message)
  }
}

const handleViewVideoDialog = (videoType: string) => {
  videoDialogTitle.value = videoType === 'taobao' ? t('guideForTaobao') : t('guideFor1688')
  guideVideo.value = videoType === 'taobao' ? 'taobao' : '1688'
  videoDialogVisible.value = true
}

watch(videoDialogVisible, (newVal) => {
  if (!newVal) {
    videoRef.value?.pause()
  }
})

defineExpose({
  show
})
</script>

<template>
  <DynamicDialog v-model="dialogVisible" :title="t('ourLocationInChina')" v-loading="isLoading">
    <p class="leading-5 text-sm uno-text-main">{{ t('isQuestionUsingApps') }}</p>

    <div class="flex justify-between gap-2 w-full mt-5">
      <div class="flex items-center gap-3 p-3 bg-[#f9fafb] rounded-[16px] w-full max-md:flex-col text-left gap-3">
        <div class="flex items-center overflow-hidden rounded-[12px]">
          <img class="w-[38px] h-[38px] max-md:w-full" :src="PinduoduoIcon" />
        </div>
        <div class="max-md:flex-col">
          <el-text tag="p" class="text-[13px] font-medium uno-text-main mb-1">{{ t('guideForTaobao') }}</el-text>
          <el-text @click="handleViewVideoDialog('taobao')" tag="p" type="primary" class="manual-link"
            >{{ t('viewGuideVideo')
            }}<el-icon>
              <ArrowRight />
            </el-icon>
          </el-text>
        </div>
      </div>
      <div class="flex items-center gap-3 p-3 bg-[#f9fafb] rounded-[16px] w-full max-md:flex-col max-md:text-left">
        <div class="image flex items-center overflow-hidden rounded-[12px]">
          <img class="w-[38px] h-[38px] max-md:w-full" :src="SecondAppIcon" />
        </div>
        <div class="max-md:flex-col">
          <el-text tag="p" class="manual-text text-[13px] font-medium uno-text-main mb-1">{{
            t('guideFor1688')
          }}</el-text>
          <el-text
            @click="handleViewVideoDialog('1688')"
            tag="p"
            type="primary"
            class="text-[13px] font-medium text-[#007aff] flex items-start cursor-pointer text-wrap max-md:text-[12px]"
            ><span>{{ t('viewGuideVideo') }}</span
            ><el-icon>
              <ArrowRight />
            </el-icon>
          </el-text>
        </div>
      </div>
      <DynamicDialog class="videoDialog" v-model="videoDialogVisible" :title="videoDialogTitle">
        <video
          ref="videoRef"
          controls
          autoplay
          class="guide-video"
          :src="guideVideo === 'taobao' ? AppPinduoduoVideo : App1688Video"
        />
      </DynamicDialog>
    </div>
    <div class="warning-info">
      <el-text tag="p" type="info" class="info-text">{{ t('warningInfo') }}</el-text>
    </div>
    <div>
      <div class="postcode-action">
        <el-text class="postcode-title" tag="h4">{{ t('post') }}</el-text>
        <div class="postcode-item">
          <el-text tag="p" type="info">{{ t('postalCode') }}</el-text>
          <div v-if="addressAvailable" class="postcode-copy">
            <div class="copy-value" v-html="postalCode" />
            <el-icon class="copy-icon" @click="CopyPostcode('postcode')">
              <CopyDocument />
            </el-icon>
          </div>
          <el-text v-else tag="p" type="primary">{{ t('postalCode.notAvailable') }}</el-text>
        </div>
      </div>

      <div class="postcode-action">
        <el-text class="postcode-title" tag="h4">{{ t('address') }}</el-text>
        <div class="postcode-item">
          <div class="postcode-copy">
            <div v-if="addressAvailable" class="china-address" v-html="address" />
            <el-text v-else tag="p" type="primary">{{ t('address.notAvailable') }}</el-text>
          </div>
        </div>
        <el-button
          :disabled="!addressAvailable"
          :class="{ 'disabled-btn': !addressAvailable }"
          class="copy-btn"
          icon="CopyDocument"
          @click="CopyPostcode('location')"
          >{{ t('copy') }}</el-button
        >
      </div>
    </div>
  </DynamicDialog>
</template>

<style lang="scss" scoped>
@mixin f-style($fSize, $fWeight, $color) {
  font-size: $fSize;
  font-weight: $fWeight;
  color: $color;
}

:deep(.el-drawer__header) {
  padding: 45px 0 20px !important;
}

:deep(.el-overlay .videoDialog) {
  max-width: 100% !important;

  @media screen and (min-width: 770px) {
    max-width: 366px !important;
  }
}

:deep(.el-overlay .videoDialog .el-drawer__body) {
  @media screen and (max-width: 770px) {
    display: flex;
    justify-content: center;
  }
}

.guide-video {
  height: 575px;
  width: 100% !important;
  object-fit: contain;
  border-radius: 16px !important;
  overflow: hidden !important;

  @media screen and (min-width: 770px) {
    max-width: 100% !important;
    height: auto !important;
    width: 100%;
  }
}

.warning-info {
  margin-top: 20px;
  border-radius: 16px;
  padding: 12px;
  border: 1px solid #d81b511a;
  background-color: #d81b511a;

  .info-text {
    @include f-style(13px, 500, #111827);
    line-height: 20px;
  }
}

.china-address {
  @include f-style(14px, 500, #111827);
}

.postcode-action {
  margin-top: 20px;
  background-color: #f9fafb;
  border: 1px solid #f3f4f6;
  border-radius: 20px;
  padding: 16px;

  .postcode-title {
    @include f-style(14px, 600, #111827);
  }

  .postcode-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 16px;

    p {
      @include f-style(14px, 500, #6b7280);
    }

    .postcode-copy {
      display: flex;
      align-items: center;
      gap: 8px;

      .copy-value {
        @include f-style(14px, 600, #111827);
        display: flex;
      }

      .copy-icon {
        color: #007aff;
        font-size: 18px;
        cursor: pointer;
      }
    }
  }

  .copy-btn {
    width: 100%;
    margin-top: 14px;
    border-radius: 12px;
    background-color: #030712;
    padding: 20px 0;
    @include f-style(15px, 500, #fff);
  }
}

.disabled-btn {
  background-color: #a0a0a1 !important;
}

@media only screen and (max-width: 770px) {
  .china-address {
    @include f-style(11px, 500, #111827 !important);
  }
}
</style>
