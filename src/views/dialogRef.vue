<script setup lang="ts">
import BDialog from '@/components/BDialog.vue'
import clientService from '@/api/ClientService'
import { ElMessage, FormInstance } from 'element-plus'
import { reactive, ref } from 'vue'
import { cloneDeep, isObject, omitBy } from 'lodash-es'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineOptions({
  name: 'UserDialog'
})

const defaultFormData: any = {
  id: null,
  code: null,
  companyId: null,
  name: null,
  phoneNumber: null,
  passportNo: null,
  email: null,
  isActive: true
}

const emits = defineEmits(['refresh'])
const title = ref('User')
const dialogVisible = ref<boolean>(false)
const formData = reactive(cloneDeep(defaultFormData))
const formRef = ref<FormInstance | null>(null)

const show = (data: any) => {
  title.value = (data?.id ? t('edit') : t('add')) + t('user')
  updateFormData(data)
  dialogVisible.value = true
}

const updateFormData = (user = defaultFormData) => {
  Object.assign(formData, omitBy(user, isObject))
}

const resetForm = () => {
  formRef.value?.clearValidate()
  updateFormData()
}
const cancel = () => {
  dialogVisible.value = false
  resetForm()
}

const handleSave = () => {
  formRef.value?.validate(async (valid: boolean, fields) => {
    if (!valid) return console.error(t('form.validate.fail'), fields)
    await clientService.save(formData)
    ElMessage.success(t('message.success'))
    emits('refresh')
    dialogVisible.value = false
  })
}

defineExpose({
  show
})

const formRules = {
  name: [{ required: true, trigger: 'blur', message: t('placeholder.input') + t('name') }],
  companyId: [{ required: true, trigger: 'blur', message: t('placeholder.select') + t('company') }],
  phoneNumber: [{ required: true, trigger: 'blur', message: t('placeholder.input') + t('phoneNumber') }],
  passportNo: [{ required: true, trigger: 'blur', message: t('placeholder.input') + t('passportNo') }]
}
</script>

<template>
  <BDialog :title="title" v-model:dialogVisible="dialogVisible" @confirm="handleSave" @cancel="cancel">
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
        <el-form-item prop="name" :label="$t('name')">
          <el-input v-model="formData.name" />
        </el-form-item>
      </el-form>
    </template>
  </BDialog>
</template>
