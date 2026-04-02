<template>
  <BDialog
    :title="$t('updatePassword')"
    v-model:dialogVisible="dialogVisible"
    @confirm="handleChangePassword"
    @cancel="cancel"
  >
    <template #form>
      <el-form
        ref="formRef"
        :model="formData"
        center
        :rules="formRules"
        label-width="100px"
        style="max-width: 380px"
        size="large"
        label-position="right"
      >
        <el-form-item prop="newPassword" :label="$t('newPassword')">
          <el-input v-model="formData.newPassword" type="password" show-password autocomplete="off" clearable />
        </el-form-item>
        <el-form-item prop="confirmPassword" :label="$t('confirmPassword')">
          <el-input v-model="formData.confirmPassword" type="password" show-password autocomplete="off" clearable />
        </el-form-item>
      </el-form>
    </template>
  </BDialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import BDialog from '@/components/BDialog.vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { getConfirmPasswordValidator, getPasswordValidator } from '@/utils'

const { t } = useI18n()

const dialogVisible = ref(false)
const formData = reactive({
  newPassword: '',
  confirmPassword: ''
})

const props = defineProps({
  service: {
    type: Object,
    required: true
  }
})

const formRules = {
  newPassword: getPasswordValidator(t),
  confirmPassword: getConfirmPasswordValidator(t, formData)
}

const formRef = ref()
let userId: number | undefined
const handleChangePassword = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return

    await props.service.updatePassword({
      password: formData.newPassword,
      id: userId
    })
    ElMessage.success(t('message.success'))
    dialogVisible.value = false
  })
}

const cancel = () => {
  dialogVisible.value = false
}

defineExpose({
  show: (id?: number) => {
    formData.newPassword = ''
    formData.confirmPassword = ''
    userId = id
    dialogVisible.value = true
  }
})
</script>
