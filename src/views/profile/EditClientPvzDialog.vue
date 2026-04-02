<script setup lang="ts">
import DynamicDialog from '@/components/DynamicDialog/DynamicDialog.vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AddressPvzIcon from '@/assets/svg/addressPvz.svg'
import { LocationInfoDTO } from 'types/api'

const { t } = useI18n()

const dialogVisible = ref<boolean>(false)

const form = ref<LocationInfoDTO>({} as LocationInfoDTO)

const show = (location: LocationInfoDTO) => {
  console.log('location', location)
  Object.assign(form.value, location)
  dialogVisible.value = true
}
const close = () => {
  dialogVisible.value = false
}
const isLoading = ref<boolean>(false)
const formRef = ref()

const formData = ref({
  id: '',
  name: '',
  phoneNumber: '',
  extraPhoneNumber: ''
})

const handleSave = () => {
  isLoading.value = true
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      isLoading.value = false
      return
    }
    try {
      console.log('Form data:', formData.value)
      dialogVisible.value = false
    } catch (error) {
      console.error(error)
    } finally {
      isLoading.value = false
    }
  })
}

const formRules = {
  phoneNumber: [{ required: false, message: t('placeholder.input'), trigger: 'blur' }],
  name: [{ required: true, message: t('placeholder.input'), trigger: 'blur' }]
}

defineExpose({
  show,
  close
})
</script>

<template>
  <DynamicDialog size="100%" :radius-disabled="true" :radius="true" :title="t('edit.address')" v-model="dialogVisible">
    <div class="all-details-wrapper">
      <div class="edit-details-wrapper">
        <div class="address-info edit-detail">
          <el-text class="address-title" tag="h4">{{ t('deliveryAddress') }}</el-text>
          <div class="info-card">
            <img :src="AddressPvzIcon" class="media-img" />
            <el-text class="address-text" tag="h4">{{ form.fullAddress }}</el-text>
            <el-icon class="right-icon">
              <ArrowRight />
            </el-icon>
          </div>
        </div>

        <div class="client-info edit-detail">
          <el-text class="client-title" tag="h4">{{ t('recipientInfo') }}</el-text>
          <el-form @submit.prevent="handleSave" :rules="formRules" ref="formRef" label-position="top" :model="formData">
            <el-form-item prop="name" :label="t('receiverName')">
              <div class="phone-input-container">
                <input class="phone-input" :placeholder="t('enterReceiverName')" v-model="formData.name" />
              </div>
            </el-form-item>
            <el-form-item prop="phoneNumber" :label="t('phoneNumber')">
              <div class="phone-input-container">
                <span class="phone-prefix">+998</span>
                <input
                  type="number"
                  class="phone-input"
                  :placeholder="t('phoneNumber')"
                  max="9"
                  v-model="formData.phoneNumber"
                />
              </div>
            </el-form-item>
            <el-form-item prop="extraPhoneNumber" :label="t('additionalPhone')">
              <div class="phone-input-container">
                <span class="phone-prefix">+998</span>
                <input
                  type="number"
                  class="phone-input"
                  :placeholder="t('additionalPhone')"
                  max="9"
                  v-model="formData.extraPhoneNumber"
                />
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div class="form-actions">
        <el-button :loading="isLoading" class="save-btn" type="primary" @click="handleSave">{{ t('save') }}</el-button>
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

.all-details-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

:deep(.el-form-item__label) {
  @include f-style(12px, 500, #9ca3af);
}

.edit-details-wrapper {
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
  margin-top: 16px;
}

.item-input {
  border-radius: 16px !important;
  border: 1px solid #e5e7eb;
  height: 48px;
  outline: none;
}

:deep(.el-input__inner) {
  @include f-style(14px, 500, #111827);
}

.phone-input-container {
  position: relative;
  width: 100% !important;
  display: flex;
  align-items: baseline;
  column-gap: 0.4rem;
  padding: 0 15px;
  border-radius: 32px;
  height: 45px;
  background-color: #f3f4f6;

  .phone-prefix {
    @include f-style(15px, 500, #111827);
  }

  .phone-input {
    width: 100% !important;
    height: 100%;
    border-radius: 16px !important;
    border: none !important;
    outline-style: none;
    @include f-style(15px, 500, #111827);
    background-color: transparent;

    &:focus {
      outline-color: none !important;
    }
  }
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  gap: 8px;

  button {
    width: 100%;
    height: 48px;
    @include f-style(15px, 500, #111827);
    border-radius: 16px;
  }

  .save-btn {
    background-color: #030712;
    color: #fff;
    border: none;
    margin: 0;
  }
}

:deep(.el-input__wrapper) {
  border-radius: 16px !important;
}

.address-info,
.client-info {
  .address-title,
  .client-title {
    @include f-style(16px, 700, #111827);
    margin-bottom: 16px;
  }

  .info-card {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    width: 100%;
    gap: 10px;
    padding: 16px;
    border-radius: 16px;
    border: 1px solid #e5e7eb;

    .location-icon {
      width: 24px;
      height: 24px;
    }

    .address-text {
      @include f-style(14px, 600, #111827);
      line-height: 120%;
    }
  }
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}

@media only screen and (max-width: 770px) {
  :deep(.el-input.is-disabled .el-input__wrapper) {
    box-shadow: none;
    border: none;
  }

  :deep(.el-input__inner) {
    @include f-style(14px, 600, #111827);
  }

  :deep(.el-input.is-disabled .el-input__wrapper) {
    box-shadow: none;
    border: none;
  }

  .item-input {
    border: none;
  }

  :deep(.el-input__wrapper) {
    border: none !important;
    background-color: #f3f4f6;
    box-shadow: none;
    border-radius: 32px !important;
  }
}
</style>
