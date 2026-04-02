<script setup lang="ts">
import { ElMessage, FormInstance } from 'element-plus'
import { ref } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { useI18n } from 'vue-i18n'
import DynamicDialog from '@/components/DynamicDialog/DynamicDialog.vue'
import { formatPhone } from '@/utils'

const { t } = useI18n()

const telegramService = window.Telegram
telegramService.WebApp.ready()

const isLoading = ref<boolean>(false)
const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)

const formData = ref({
  id: useUserStore().clientId,
  phoneNumber: useUserStore().phone?.split(' ').join(''),
  name: useUserStore().username || ''
})

const handleCancel = (): void => {
  dialogVisible.value = false
}

const show = (): void => {
  dialogVisible.value = true
  handleInput(useUserStore().phone)
}

const handleSave = () => {
  console.log('formdata', formData.value)
  isLoading.value = true
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      isLoading.value = false
      return
    }
    try {
      await useUserStore().updateClientDetails(formData.value)
      ElMessage.success(t('message.success'))
      telegramService.WebApp.close()
    } catch (error) {
      console.log(error)
    } finally {
      isLoading.value = false
      dialogVisible.value = false
    }
  })
}
const handleInput = (eventOrPhone?: Event | string) => {
  if (typeof eventOrPhone === 'string') {
    formData.value.phoneNumber = eventOrPhone?.split(' ').join('')
  } else if (eventOrPhone instanceof Event) {
    const target = eventOrPhone.target as HTMLInputElement
    formData.value.phoneNumber = target.value?.split(' ').join('')
  }
}

const formRules = {
  phoneNumber: [{ required: false, message: t('placeholder.input'), trigger: 'blur' }],
  name: [{ required: true, message: t('placeholder.input'), trigger: 'blur' }]
}

defineExpose({
  show
})
const dialogStyle = {
  maxWidth: '440px',
  borderRadius: '24px'
}
</script>

<template>
  <DynamicDialog :position-style="dialogStyle" size="60%" v-model="dialogVisible" :title="t('personalDetails')">
    <el-form @submit.prevent="handleSave" :rules="formRules" ref="formRef" label-position="top" :model="formData">
      <el-form-item prop="phoneNumber" :label="t('phoneNumber')">
        <div class="relative w-full! flex items-center gap-[10px] px-4 rounded-[16px] h-11 bg-[#f3f4f6]">
          <span class="text-[15px] font-medium uno-text-main">+998</span>
          <input
            disabled
            class="w-full! h-full rounded-[16px]! border-none! outline-none text-[15px] font-medium uno-text-main bg-transparent focus:outline-none!"
            placeholder="90 338 08 08"
            max="9"
            v-model="formData.phoneNumber"
            @input="handleInput"
          />
        </div>
      </el-form-item>
      <el-form-item prop="name" :label="t('username')">
        <el-input
          class="rounded-[16px]! border-solid! border border-[#e5e7eb]! h-12 outline-none! max-md:border-none!"
          v-model="formData.name"
          :placeholder="t('username')"
        />
      </el-form-item>
      <div class="flex justify-center mt-6 gap-2 max-md:flex-col-reverse">
        <el-button
          class="w-full h-12 text-[15px]! font-medium! uno-text-main border-solid border-[#E5E7EB] hover:bg-[#f3f4f6] hover:border-[#f3f4f6] max-md:bg-[#f3f4f6]! max-md:border-none m-0"
          @click="handleCancel"
          >{{ t('cancel') }}</el-button
        >
        <el-button
          native-type="submit"
          :disabled="formData.name === useUserStore().username"
          :loading="isLoading"
          class="w-full h-12! text-[15px]! font-medium bg-[#030712]! hover:opacity-70 text-white! border-none"
          type="primary"
          @click="handleSave"
          >{{ t('saveChanges') }}</el-button
        >
      </div>
    </el-form>
  </DynamicDialog>
</template>

<style lang="scss" scoped>
@mixin f-style($fSize, $fWeight, $color) {
  font-size: $fSize;
  font-weight: $fWeight;
  color: $color;
}

:deep(.el-button).is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

:deep(.el-input__inner) {
  @include f-style(14px, 500, #111827);
}

:deep(.el-input__wrapper) {
  border-radius: 16px !important;
}

@media only screen and (max-width: 770px) {
  :deep(.el-input__inner) {
    @include f-style(14px, 600, #111827);
  }

  :deep(.el-input.is-disabled .el-input__wrapper) {
    box-shadow: none;
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
