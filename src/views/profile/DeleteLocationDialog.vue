<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { LocationInfoDTO } from 'types/api'
import { useSoftDeletePersonPvzMutation } from '@/hooks/mutations/usePvzMutation'
import { ElMessage } from 'element-plus'
import { AxiosError } from 'axios'

const { t } = useI18n()
const dialogVisible = ref<boolean>(false)
const deleteLocationData = reactive<LocationInfoDTO>({} as LocationInfoDTO)

const { mutateAsync, isPending } = useSoftDeletePersonPvzMutation()

const show = (location: LocationInfoDTO) => {
  dialogVisible.value = true
  Object.assign(deleteLocationData, location)
}

const close = () => {
  dialogVisible.value = false
}

const handleDeleteLocation = async (): Promise<void> => {
  try {
    await mutateAsync(deleteLocationData.id)
    close()
  } catch (error: any) {
    ElMessage.error(error?.message || error?.response?.data?.message || t('message.error'))
  }
}

defineExpose({ show })
</script>

<template>
  <el-dialog
    top="32vh"
    class="delete__location-dialog"
    v-model="dialogVisible"
    :title="t('delete.address')"
    style="max-width: 440px; width: 100%; padding: 20px; border-radius: 24px"
  >
    <el-text class="confirm-text text-[15px]! font-medium! uno-text-main">{{ t('confirm.delete.address') }}</el-text>
    <div class="flex items-center justify-center gap-2 mt-6">
      <el-button
        @click="close"
        class="uno-text-main text-[15px]! font-medium! border-[#E5E7EB] h-12 w-full rounded-[16px]! hover:bg-[#F9FAFB]! hover:border-[#E5E7EB]"
        >{{ t('cancel') }}</el-button
      >
      <el-button
        @click="handleDeleteLocation"
        :loading="isPending"
        class="border-none! text-white! font-medium! text-[15px]! w-full h-12 rounded-[16px]! bg-[#D81B51]! hover:opacity-80"
        >{{ t('delete') }}</el-button
      >
    </div>
  </el-dialog>
</template>
