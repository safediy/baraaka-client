<script lang="ts" setup>
import { PersonPvzDTO } from 'types/pvz'
import { useI18n } from 'vue-i18n'
import DeleteIcon from '@/assets/svg/delete.svg'
import { formatPhone } from '@/utils'
import { computed, ref } from 'vue'
import { CopyDocument } from '@element-plus/icons-vue'
import NoImg from '@/assets/noImg.jpg'
import { ElMessage } from 'element-plus'
import RatingPvzDialog from './RatingPvzDialog.vue'
import { SERVICES } from '@/constants/services'
import DeleteLocationDialog from '../../DeleteLocationDialog.vue'

const { t } = useI18n()

const props = defineProps<{
  item: PersonPvzDTO
  isActive: boolean
  handleDeleteLocation: (item: PersonPvzDTO) => void
}>()

const emit = defineEmits(['select', 'refresh'])

const ratingPvzDialog = ref()
const deleteLocationDialog = ref()

const phoneNumbers = computed(() => {
  if (!props.item.phone) return []

  return props.item.phone
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
})
const copyPhone = async (phone: string) => {
  try {
    await navigator.clipboard.writeText(phone)
    ElMessage.success(t('message.copied'))
  } catch (err) {
    console.error('Copy failed', err)
  }
}

const handleRate = () => {
  ratingPvzDialog.value.show(props.item)
}

const handleDelete = (location: PersonPvzDTO): void => {
  deleteLocationDialog.value.show(location)
}
</script>

<template>
  <div
    @click="emit('select', item)"
    class="w-full rounded-[16px] p-4 flex items-start justify-between gap-4 border-solid! border-2! hover:cursor-pointer!"
    :class="[isActive ? 'border-primary! bg-white shadow-sm' : 'border-gray-200! bg-white hover:border-gray-300!']"
  >
    <div class="flex flex-col gap-2 max-w-[480px] w-full md:max-w-full gap-0">
      <div class="flex items-start justify-between gap-2 w-full">
        <div class="flex items-center gap-3 max-md:flex-col-reverse">
          <div class="shadow-sm rounded-[8px] w-11 h-11 flex object-contain items-center w-fit p-2">
            <img class="w-full h-full object-contain" :src="SERVICES[item.service]?.logo || NoImg" />
          </div>
          <div v-if="item.isSelected" class="mb-2">
            <span class="bg-[#007AFF1A] text-[#007AFF] text-[12px] font-semibold rounded-[32px] py-1 px-2">
              {{ t('selected') }}
            </span>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <div
            @click="handleRate"
            v-if="item.isRated === false"
            class="bg-[#FEF3C7] rounded-full p-2 h-6 flex items-center gap-0.5 cursor-pointer hover:opacity-90"
          >
            <el-icon class="text-[#A35D2C] mb-.5!">
              <StarFilled />
            </el-icon>
            <span class="text-[12px] font-medium! text-[#A35D2C]">{{ t('action.rate') }}</span>
          </div>
          <el-button
            class="p-0! m-0! border-none! bg-transparent! hover:scale-110 transition-transform opacity-70 hover:opacity-100"
            circle
            @click.stop="handleDelete(item)"
          >
            <img :src="DeleteIcon" class="w-5 h-5" />
          </el-button>
        </div>
      </div>
      <div class="flex items-center gap-3.5 mt-2 w-full max-md:gap-2.5">
        <div v-for="(phone, index) in phoneNumbers" :key="index" class="flex items-center gap-1.5">
          <p class="text-[13px] font-medium uno-text-main max-md:text-[12px] max-md:text-[#6B7280]!">
            {{ phone.length === 9 ? `+998 ${formatPhone(phone)}` : phone }}
          </p>

          <el-button size="small" text @click="copyPhone(phone)" class="p-0! w-2 h-2">
            <el-icon class="text-[13px]">
              <copy-document />
            </el-icon>
          </el-button>
        </div>
      </div>
      <p class="text-[14px] leading-5 uno-text-main">{{ item.fullAddress }}</p>
    </div>
  </div>
  <RatingPvzDialog ref="ratingPvzDialog" />
  <DeleteLocationDialog ref="deleteLocationDialog" />
</template>

<style lang="scss" scoped></style>
