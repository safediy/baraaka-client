<script lang="ts" setup>
import { computed, ref, nextTick } from 'vue'
import EyeIcon from '@/assets/svg/eye-2-line.svg'
import { useI18n } from 'vue-i18n'
import WaybillService from '@/api/WaybillService'
import { DeliveryStatusEnum, PayStatusEnum } from '@/constants/api'
import { formattedNumber } from '@/utils'
import { useRouter } from 'vue-router'
import DynamicDialog from '@/components/DynamicDialog/DynamicDialog.vue'
import ImagePreviewDialog from '@/components/ImagePreviewDialog.vue'
import StatusesTimeline from './StatusesTimeline.vue'
import AddressTimeline from './AddressTimeline.vue'
import RelogLogo from '@/assets/relog.png'
import emuLogo from '@/views/map/images/emu.svg?url'
import IpostLogo from '@/assets/service-images/ipost.svg?url'
import uzPostSvg from '@/views/map/images/uzPost.svg?url'
import StarexLogo from '@/assets/service-images/starex.svg?url'
import BtsLogo from '@/assets/service-images/bts.svg?url'
import IpostGo from '@/assets/service-images/iPost-go.jpg'
import TruckLogo from '@/assets/svg/truck-fill.svg?url'
import { CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { WaybillInfoDTO, WaybillInfoViewDTO } from 'types/waybill'

const { t } = useI18n()
const router = useRouter()

const activeInfo = ref('')
const imagePreviewDialog = ref()
const showPreview = ref<boolean>(false)
const dialogVisible = ref<boolean>(false)
const waybillInfo = ref<WaybillInfoViewDTO>({} as WaybillInfoViewDTO)
const isLoading = ref<boolean>(false)
const isEditingDescription = ref<boolean>(false)
const descriptionText = ref<string>('')
const originalDescriptionText = ref<string>('')
const isSavingDescription = ref<boolean>(false)
const descriptionTextareaRef = ref<any>(null)

// Separate state for editing remark in collapse
const isEditingRemark = ref<boolean>(false)
const remarkText = ref<string>('')
const originalRemarkText = ref<string>('')
const isSavingRemark = ref<boolean>(false)

const fetchWaybillData = async (id: number) => {
  isLoading.value = true
  try {
    const response = await WaybillService.view(id)
    console.log(response)
    waybillInfo.value = response
  } finally {
    isLoading.value = false
  }
}
const svg: Record<number, string> = {
  0: TruckLogo,
  1: uzPostSvg,
  2: RelogLogo,
  3: IpostLogo,
  4: emuLogo,
  5: StarexLogo,
  6: BtsLogo
}
const view = async (waybill: WaybillInfoDTO) => {
  dialogVisible.value = true

  await fetchWaybillData(waybill.id)
  if (!waybillInfo?.value) return
  // Only update fields that might not be in the view response, but don't override remark
  // since the server response has the latest remark data
  waybillInfo.value.weight = waybill.weight
  waybillInfo.value.payAmountSom = waybill.payAmountSom
  waybillInfo.value.status = waybill.status
  waybillInfo.value.payStatus = waybill.payStatus
  // Use remark from server response (waybillInfo.value.remark), not from list item
  // The server response has the most up-to-date remark
  // Initialize description text from remark
  descriptionText.value = waybillInfo.value.remark || ''
  // Initialize remark text for collapse section
  remarkText.value = waybillInfo.value.remark || ''
  isEditingDescription.value = false
  isEditingRemark.value = false
}

const isEditableStatus = computed(() => {
  if (!waybillInfo.value?.status) return false

  return [
    DeliveryStatusEnum.CREATED
    // DeliveryStatusEnum.Warehouse,
    // DeliveryStatusEnum.Yiwu,
    // DeliveryStatusEnum.Ulugchat,
    // DeliveryStatusEnum.Osh
  ].includes(waybillInfo.value.status)
})

const handleEditAddress = () => {
  if (isEditableStatus.value) {
    router.push({
      name: 'ServiceMap',
      query: {
        trackingNumber: waybillInfo.value?.trackingNumber
      }
    })
  }
}

const handleShowPreview = (images: any): void => {
  imagePreviewDialog.value.show(images, 0)
}

const copyBatchCode = async (batchCode: string) => {
  if (!batchCode) return

  try {
    await navigator.clipboard.writeText(batchCode)
    ElMessage({
      message: `${batchCode} ${t('message.copiedBatchCode')}`,
      type: 'success',
      duration: 1500
    })
  } catch (err) {
    ElMessage({
      message: t('message.error'),
      type: 'error',
      duration: 1500
    })
  }
}

const handleSaveDescription = async () => {
  if (!waybillInfo.value?.id) return

  // Validate length only (allow empty string to clear remark)
  if (descriptionText.value.length > 100) {
    return
  }

  isSavingDescription.value = true
  try {
    // Send trimmed value, or space if empty (server requires non-empty string)
    const remarkValue = descriptionText.value.trim() || ' '
    await WaybillService.saveRemark(waybillInfo.value.id, remarkValue)
    // Refresh waybill data from server to get latest remark
    await fetchWaybillData(waybillInfo.value.id)
    isEditingDescription.value = false
    // Sync descriptionText and remarkText with server data
    if (waybillInfo.value) {
      descriptionText.value = waybillInfo.value.remark || ''
      remarkText.value = waybillInfo.value.remark || ''
    }
  } catch (error) {
    console.error('Failed to save remark:', error)
    // Restore original text on error
    descriptionText.value = originalDescriptionText.value
  } finally {
    isSavingDescription.value = false
  }
}

const handleEditDescription = async () => {
  originalDescriptionText.value = descriptionText.value
  isEditingDescription.value = true
  // Focus the textarea after it appears
  await nextTick()
  if (descriptionTextareaRef.value) {
    descriptionTextareaRef.value.focus()
  }
}

const handleCancelEdit = () => {
  descriptionText.value = originalDescriptionText.value
  isEditingDescription.value = false
}

const handleFormSubmit = () => {
  handleSaveDescription()
}

const handleTextareaKeydown = (event: KeyboardEvent) => {
  // Submit on Enter, allow Shift+Enter for new line
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    if (!isSavingDescription.value && descriptionText.value.length <= 100) {
      handleSaveDescription()
    }
  }
}

const handleRemarkFormSubmit = () => {
  handleSaveRemark()
}

const handleRemarkTextareaKeydown = (event: KeyboardEvent) => {
  // Submit on Enter, allow Shift+Enter for new line
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    if (!isSavingRemark.value && remarkText.value.length <= 100) {
      handleSaveRemark()
    }
  }
}

const handleEditRemark = () => {
  originalRemarkText.value = remarkText.value
  isEditingRemark.value = true
}

const handleSaveRemark = async () => {
  if (!waybillInfo.value?.id) return

  // Validate length only (allow empty string to clear remark)
  if (remarkText.value.length > 100) {
    return
  }

  isSavingRemark.value = true
  try {
    // Send trimmed value, or space if empty (server requires non-empty string)
    const remarkValue = remarkText.value.trim() || ' '
    await WaybillService.saveRemark(waybillInfo.value.id, remarkValue)
    // Refresh waybill data from server to get latest remark
    await fetchWaybillData(waybillInfo.value.id)
    isEditingRemark.value = false
    // Sync descriptionText and remarkText with server data
    if (waybillInfo.value) {
      descriptionText.value = waybillInfo.value.remark || ''
      remarkText.value = waybillInfo.value.remark || ''
    }
  } catch (error) {
    console.error('Failed to save remark:', error)
    // Restore original text on error
    remarkText.value = originalRemarkText.value
  } finally {
    isSavingRemark.value = false
  }
}

const handleCancelRemarkEdit = () => {
  remarkText.value = originalRemarkText.value
  isEditingRemark.value = false
}

const copyTrackingNumber = async (trackingNumber: string) => {
  try {
    await navigator.clipboard.writeText(trackingNumber)
    ElMessage({
      message: `${trackingNumber} ${t('message.copiedTrackingNumber')}`,
      type: 'success',
      duration: 1500
    })
  } catch (err) {
    ElMessage({
      message: t('message.error'),
      type: 'error',
      duration: 1500
    })
  }
}

defineExpose({
  view
})
</script>

<template>
  <div class="header" />
  <DynamicDialog v-model="dialogVisible" :title="t('order')">
    <el-skeleton :loading="isLoading" animated>
      <template #template>
        <div class="skeleton-content">
          <!-- Address Skeleton -->
          <div class="order-details address skeleton-item">
            <el-skeleton-item variant="rect" style="width: 60px; height: 60px; border-radius: 8px" />
            <div class="skeleton-text-wrapper">
              <el-skeleton-item variant="text" style="width: 80%; height: 16px" />
              <el-skeleton-item variant="text" style="width: 60%; height: 14px; margin-top: 8px" />
            </div>
          </div>
          <!-- Details Skeleton -->
          <div class="order-details skeleton-item">
            <div class="detail skeleton-detail">
              <el-skeleton-item variant="text" style="width: 120px; height: 14px" />
              <el-skeleton-item variant="text" style="width: 150px; height: 14px" />
            </div>
            <div class="detail skeleton-detail">
              <el-skeleton-item variant="text" style="width: 100px; height: 14px" />
              <el-skeleton-item variant="text" style="width: 100px; height: 14px" />
            </div>
            <div class="detail skeleton-detail">
              <el-skeleton-item variant="text" style="width: 80px; height: 14px" />
              <el-skeleton-item variant="text" style="width: 200px; height: 14px" />
            </div>
          </div>
        </div>
      </template>
      <template #default>
        <div @click="handleEditAddress" class="order-details address">
          <div class="h-10 flex items-center">
            <img
              :src="waybillInfo.pickUpPoint?.service !== undefined ? svg[waybillInfo.pickUpPoint?.service] : TruckLogo"
              class="w-[55px] h-[55px] object-contain rounded-lg!"
            />
          </div>
          <div>
            <p class="address">{{ waybillInfo?.pickUpPoint?.fullAddress || t('address.notAvailable') }}</p>
          </div>
          <el-icon v-if="isEditableStatus" class="right-icon">
            <ArrowRight />
          </el-icon>
        </div>

        <div v-if="waybillInfo?.pickupPoint_history?.length" class="addressTimeline-wrapper">
          <el-collapse v-model="activeInfo" class="border-none!" accordion>
            <el-collapse-item :title="t('deliveryHistoryTitle')" class="border-none! border-white!">
              <AddressTimeline :activities="waybillInfo?.pickupPoint_history" />
            </el-collapse-item>
          </el-collapse>
        </div>

        <div class="order-details">
          <div class="detail">
            <span class="label">{{ t('trackingNumber') }}</span>
            <div class="flex items-center gap-2">
              <span class="value">{{ waybillInfo?.trackingNumber }}</span>
              <el-icon
                class="cursor-pointer !text-[15px] !font-semibold hover:text-blue-500 transition"
                @click.stop.prevent="copyTrackingNumber(waybillInfo?.trackingNumber)"
              >
                <CopyDocument />
              </el-icon>
            </div>
          </div>
          <div v-if="waybillInfo?.batchCode" class="detail">
            <span class="label">{{ t('batchCode') }}</span>
            <div class="flex items-center gap-3">
              <span type="primary" class="value">{{ waybillInfo?.batchCode }}</span>
              <el-icon
                class="cursor-pointer !text-[17px] !font-semibold hover:text-blue-500 transition"
                @click="copyBatchCode(waybillInfo?.batchCode)"
              >
                <CopyDocument />
              </el-icon>
            </div>
          </div>
          <template
            v-if="
              waybillInfo?.status !== DeliveryStatusEnum.UN_LAWFUL && waybillInfo?.status !== DeliveryStatusEnum.CREATED
            "
          >
            <div class="detail">
              <span class="label">{{ t('weight') }}</span>
              <span class="dashed" />
              <span class="value">{{ waybillInfo?.weight || 0 }} {{ t('kg') }}</span>
            </div>
            <div class="detail">
              <span class="label">{{ t('deliveryPrice') }}</span>
              <span class="dashed" />
              <span class="value">{{ formattedNumber(waybillInfo?.payAmountSom || 0) }} {{ t('sum') }}</span>
            </div>
            <div class="detail">
              <span class="label">{{ t('payStatus') }}</span>
              <span class="dashed" />
              <el-tag
                :class="waybillInfo?.payStatus === PayStatusEnum.PAID ? 'status-tag-success' : 'status-tag-warning'"
                :tag-type="waybillInfo?.payStatus === PayStatusEnum.PAID ? 'success' : 'warning'"
                >{{ t('payStatus.' + (waybillInfo?.payStatus || 'unknown')) }}</el-tag
              >
            </div>
            <div class="detail">
              <span class="label">{{ t('productImage') }}</span>
              <span class="dashed" />
              <div @click="handleShowPreview(waybillInfo.images)" class="imagePreview">
                <span>{{ t('view') }}</span>
                <img :src="EyeIcon" alt="0" />
              </div>
              <el-image-viewer
                v-if="showPreview"
                :url-list="waybillInfo?.images"
                show-progress
                @close="showPreview = false"
              />
            </div>
          </template>

          <div v-if="!waybillInfo?.remark" class="detail description-block">
            <span class="label">{{ t('comment') }}</span>
            <form @submit.prevent="handleFormSubmit" class="description-form">
              <div class="description-content">
                <template v-if="!isEditingDescription">
                  <input
                    v-model="descriptionText"
                    :placeholder="t('placeholder.comment')"
                    :class="['description-input', { 'input-empty': !descriptionText.trim() }]"
                    @click="handleEditDescription"
                    @focus="handleEditDescription"
                    readonly
                  />
                </template>
                <template v-else>
                  <div class="textarea-wrapper">
                    <textarea
                      ref="descriptionTextareaRef"
                      v-model="descriptionText"
                      :rows="3"
                      :placeholder="t('placeholder.comment')"
                      class="description-textarea"
                      maxlength="100"
                      @keydown="handleTextareaKeydown"
                    />
                    <div class="textarea-footer">
                      <span class="char-count" :class="{ 'char-count-error': descriptionText.length > 100 }">
                        {{ descriptionText.length }}/100
                      </span>
                      <div class="textarea-actions">
                        <el-button
                          type="text"
                          class="save-btn"
                          :loading="isSavingDescription"
                          :disabled="descriptionText.length > 100"
                          native-type="submit"
                        >
                          <el-icon size="16">
                            <Check />
                          </el-icon>
                        </el-button>
                        <el-button
                          type="text"
                          class="cancel-btn"
                          @click="handleCancelEdit"
                          size="small"
                          native-type="button"
                        >
                          <el-icon size="16">
                            <Close />
                          </el-icon>
                        </el-button>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </form>
          </div>

          <el-collapse v-if="waybillInfo?.remark || isEditingRemark" v-model="activeInfo" accordion>
            <el-collapse-item :title="t('details')" name="1">
              <span class="dashed" />
              <div class="remark-content">
                <template v-if="!isEditingRemark">
                  <p>{{ waybillInfo?.remark }}</p>
                  <el-button type="text" class="edit-btn" @click="handleEditRemark" size="small">
                    <el-icon size="16">
                      <Edit />
                    </el-icon>
                  </el-button>
                </template>
                <template v-else>
                  <form @submit.prevent="handleRemarkFormSubmit" class="remark-form">
                    <div class="textarea-wrapper">
                      <textarea
                        v-model="remarkText"
                        :rows="3"
                        :placeholder="t('placeholder.input')"
                        class="description-textarea"
                        maxlength="100"
                        @keydown="handleRemarkTextareaKeydown"
                      />
                      <div class="textarea-footer">
                        <span class="char-count" :class="{ 'char-count-error': remarkText.length > 100 }">
                          {{ remarkText.length }}/100
                        </span>
                        <div class="textarea-actions">
                          <el-button
                            type="text"
                            class="save-btn"
                            :loading="isSavingRemark"
                            :disabled="remarkText.length > 100"
                            native-type="submit"
                          >
                            <el-icon size="16">
                              <Check />
                            </el-icon>
                          </el-button>
                          <el-button
                            type="text"
                            class="cancel-btn"
                            @click="handleCancelRemarkEdit"
                            size="small"
                            native-type="button"
                          >
                            <el-icon size="16">
                              <Close />
                            </el-icon>
                          </el-button>
                        </div>
                      </div>
                    </div>
                  </form>
                </template>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
        <StatusesTimeline v-if="!isLoading && waybillInfo?.logistics" :activities="waybillInfo.logistics" />
      </template>
    </el-skeleton>
  </DynamicDialog>
  <ImagePreviewDialog ref="imagePreviewDialog" />
</template>

<style lang="scss" scoped>
@mixin f-style($fSize, $fWeight, $color) {
  font-size: $fSize;
  font-weight: $fWeight;
  color: $color;
}

:deep(.el-collapse-item__header) {
  width: 100%;
  background: transparent;
  // color: blue;
  border: none !important;
  padding: 0 !important;
}

:deep(.el-collapse) {
  border: none !important;
}

:deep(.el-collapse-item__wrap) {
  background: transparent;
  border: none;

  p {
    color: #000;
  }
}

.remark-content {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;

  .remark-form {
    flex: 1;
    width: 100%;
  }

  p {
    flex: 1;
    margin: 0;
    word-break: break-word;
  }

  .textarea-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .description-textarea {
    width: 100%;
    padding: 8px 12px;
    border-radius: 9px;
    border: none;
    background-color: #fff;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    outline: none;
    transition: all 0.2s;

    &:focus {
      box-shadow: none;
    }

    &::placeholder {
      color: #9ca3af;
    }
  }

  .textarea-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .char-count {
    font-size: 12px;
    color: #6b7280;
    transition: color 0.2s;

    &.char-count-error {
      color: #ef4444;
    }
  }

  .textarea-actions {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .edit-btn,
  .save-btn,
  .cancel-btn {
    padding: 0;
    min-height: auto;
    flex-shrink: 0;

    &:hover {
      background-color: rgba(0, 122, 255, 0.1);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.addressTimeline-wrapper {
  padding: 0 16px;
  margin-bottom: 12px;
}

.order-details {
  width: 100%;
  background: #f3f4f6;
  border-radius: 20px;
  padding: 16px;
  border: 1px solid #f3f4f6;

  &.address {
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 12px;

    .address {
      @include f-style(13px, 400, #111827);
      cursor: pointer;
    }

    .right-icon {
      color: #9ca3af;
    }
  }

  .detail {
    display: flex;
    justify-content: space-between;
    align-items: end;
    padding: 6px 0;
    margin-bottom: 12px;
    font-size: 14px;

    &:last-child {
      margin-bottom: 0;
    }

    .dashed {
      flex: 1;
      border-bottom: 1px dashed #e5e7eb;
    }

    .label {
      @include f-style(14px, 500, #6b7280);
    }

    .value {
      @include f-style(14px, 600, #111827);
    }

    .imagePreview {
      display: flex;
      align-items: center;
      color: #007aff;
      gap: 4px;
      cursor: pointer;
    }

    .status-tag-warning {
      border-radius: 16px;
      @include f-style(12px, 500, #ff9500);
      background-color: #ff95001a;
      border: none;
    }

    .status-tag-success {
      border-radius: 16px;
      @include f-style(12px, 500, #25a12f);
      background-color: #25a12f1a;
      border: none;
    }

    &.description-block {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;

      .description-form {
        width: 100%;
      }

      .description-content {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 8px;

        .description-text {
          flex: 1;
          @include f-style(14px, 400, #111827);
          word-break: break-word;

          &.placeholder {
            color: #9ca3af;
            font-style: italic;
          }
        }

        .description-input {
          flex: 1;
          width: 100%;
          padding: 8px 12px;
          border-radius: 9px;
          border: none;
          background-color: #fff;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: all 0.3s;
          cursor: text;
          @include f-style(14px, 400, #111827);
          position: relative;

          &::placeholder {
            color: #9ca3af;
          }

          &:hover {
            box-shadow: 0 0 0 1px rgba(0, 122, 255, 0.4);
          }

          &.input-empty {
            animation: input-pulse 2s ease-in-out infinite;

            &::placeholder {
              animation: placeholder-pulse 2s ease-in-out infinite;
            }

            &:hover {
              animation: input-pulse-hover 2s ease-in-out infinite;
            }
          }
        }

        .textarea-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .description-textarea {
          width: 100%;
          padding: 8px 12px;
          border-radius: 9px;
          border: none;
          background-color: #fff;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          outline: none;
          transition: all 0.2s;

          &:focus {
            box-shadow: 0 0 0 1px rgba(0, 122, 255, 0.4);
            outline: none;
          }

          &::placeholder {
            color: #9ca3af;
          }
        }

        .textarea-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .char-count {
          font-size: 12px;
          color: #6b7280;
          transition: color 0.2s;

          &.char-count-error {
            color: #ef4444;
          }
        }

        .textarea-actions {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .edit-btn,
        .save-btn,
        .cancel-btn {
          padding: 4px;
          min-height: auto;

          &:hover {
            background-color: rgba(0, 122, 255, 0.1);
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }
      }
    }
  }
}

.item-info {
  margin-left: 16px;

  .status {
    @include f-style(14px, 600, #111827);
    margin-bottom: 5px;
  }

  .description {
    @include f-style(14px, 400, #6b7280);
  }
}

.date {
  margin-left: auto;
  @include f-style(13px, 500, #6b7280);
  text-align: right;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0;

  .skeleton-item {
    width: 100%;

    &.address {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .skeleton-text-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .skeleton-detail {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    margin-bottom: 12px;
    gap: 8px;
  }
}

@keyframes input-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(0, 122, 255, 0.15);
  }

  50% {
    box-shadow: 0 0 0 1px rgba(0, 122, 255, 0.4);
  }
}

@keyframes placeholder-pulse {
  0%,
  100% {
    opacity: 0.7;
  }

  50% {
    opacity: 1;
  }
}

// .payment-button{
//   width: 100%;
//   border-radius: 16px;
//   background-color: #030712;
//   border: none;
//   @include f-style(15px, 500, #fff);
// }
@media only screen and (max-width: 770px) {
  .detail .status-tag {
    font-weight: 600 !important;
  }
}
</style>
