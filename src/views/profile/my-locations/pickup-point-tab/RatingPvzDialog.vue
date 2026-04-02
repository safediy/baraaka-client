<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { PersonPvzDTO } from 'types/pvz'
import DynamicDialog from '@/components/DynamicDialog/DynamicDialog.vue'
import { usePvzRatingMutation } from '@/hooks/mutations/usePvzMutation'
import { SERVICES } from '@/constants/services'
import SuccessRatingModal from './SuccessRatingModal.vue'

const { t } = useI18n()

const successModalDialog = ref()
const dialogVisible = ref(<boolean>false)
const selectedPvz = ref<PersonPvzDTO | null>(null)

const form = reactive({
  rateCleanliness: 0,
  commentCleanliness: '',
  rateTreatment: 0,
  commentTreatment: '',
  rateSpeed: 0,
  commentSpeed: ''
})

const { mutateAsync, isPending } = usePvzRatingMutation()

const show = (pvz: PersonPvzDTO) => {
  selectedPvz.value = pvz
  Object.assign(form, {
    rateCleanliness: 0,
    commentCleanliness: '',
    rateTreatment: 0,
    commentTreatment: '',
    rateSpeed: 0,
    commentSpeed: ''
  })
  dialogVisible.value = true
}

const close = () => {
  dialogVisible.value = false
}

const handleSubmit = async () => {
  if (!selectedPvz.value) return

  if (form.rateCleanliness === 0 && form.rateTreatment === 0 && form.rateSpeed === 0) {
    ElMessage.warning(t('message.pleaseRate'))
    return
  }
  try {
    await mutateAsync({
      pvzId: selectedPvz.value.id,
      ...form
    })
    ElMessage.success(t('message.ratingSuccess'))
    close()
    successModalDialog.value?.show()
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || t('message.error'))
  }
}

defineExpose({ show })
</script>

<template>
  <DynamicDialog v-model="dialogVisible" :title="t('rating.title')" width="460px">
    <div v-if="selectedPvz" class="flex flex-col gap-4">
      <div class="bg-[#f9fafb] rounded-[12px] p-3 flex items-center gap-2">
        <img :src="SERVICES[selectedPvz.service]?.logo" class="w-14 h-13 object-contain" alt="service-logo" />
        <p class="text-[14px] font-normal uno-text-main text-wrap leading-5 max-md:text-[13px]">
          {{ selectedPvz.fullAddress }}
        </p>
      </div>

      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center">
            <span class="text-[14px] font-medium uno-text-main">{{ t('rating.cleanliness') }}</span>
            <el-rate v-model="form.rateCleanliness" />
          </div>
          <el-input
            v-model="form.commentCleanliness"
            type="textarea"
            :placeholder="t('rating.commentPlaceholder')"
            :rows="2"
          />
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center">
            <span class="text-[14px] font-medium uno-text-main">{{ t('rating.treatment') }}</span>
            <el-rate v-model="form.rateTreatment" />
          </div>
          <el-input
            v-model="form.commentTreatment"
            type="textarea"
            :placeholder="t('rating.commentPlaceholder')"
            :rows="2"
          />
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center">
            <span class="text-[14px] font-medium uno-text-main">{{ t('rating.speed') }}</span>
            <el-rate v-model="form.rateSpeed" />
          </div>
          <el-input
            v-model="form.commentSpeed"
            type="textarea"
            :placeholder="t('rating.commentPlaceholder')"
            :rows="2"
          />
        </div>
      </div>

      <div class="mt-2">
        <el-button
          type="primary"
          class="w-full h-12! rounded-[12px]! text-[15px]! font-medium! bg-[#044CA2]! border-none!"
          :loading="isPending"
          @click="handleSubmit"
        >
          {{ t('label.send') }}
        </el-button>
      </div>
    </div>
    <SuccessRatingModal ref="successModalDialog" />
  </DynamicDialog>
</template>

<style lang="scss" scoped>
:deep(.el-textarea__inner) {
  border-radius: 8px;
  background-color: #fcfcfd;
  resize: none;
  font-family: 'Inter', sans-serif;

  &:focus {
    background-color: #fff;
  }
}
</style>
