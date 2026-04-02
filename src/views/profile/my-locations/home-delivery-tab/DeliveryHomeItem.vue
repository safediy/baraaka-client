<script lang="ts" setup>
import { PersonPvzDTO } from 'types/pvz'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DeleteIcon from '@/assets/svg/delete.svg'
import DeleteLocationDialog from '../../DeleteLocationDialog.vue'

const props = defineProps<{
  item: PersonPvzDTO
  isActive: boolean
}>()

const emit = defineEmits(['select', 'refresh'])
const { t } = useI18n()

const deleteLocationDialog = ref()

const handleDelete = (location: PersonPvzDTO): void => {
  deleteLocationDialog.value.show(location)
}
</script>

<template>
  <div
    @click="emit('select', item)"
    class="p-4 rounded-[16px] w-full relative cursor-pointer duration-200 transition-all border-solid! border-2!"
    :class="[isActive ? 'border-primary! bg-white shadow-sm' : 'border-gray-200! bg-white hover:border-gray-300!']"
  >
    <div v-if="item.isSelected" class="mb-2">
      <span class="bg-[#007AFF1A] text-[#007AFF] text-[12px] font-semibold rounded-[32px] py-1 px-2">
        {{ t('selected') }}
      </span>
    </div>

    <p :title="item.fullAddress" class="text-[14px] font-medium uno-text-main line-clamp-3 max-w-[210px] leading-5 m-0">
      {{ item.fullAddress }}
    </p>

    <img
      @click.stop="handleDelete(item)"
      :src="DeleteIcon"
      alt="delete"
      class="absolute right-4 top-4 w-5 h-5 object-contain hover:scale-110 transition-transform opacity-70 hover:opacity-100"
    />
  </div>
  <DeleteLocationDialog ref="deleteLocationDialog" @refresh="emit('refresh')" />
</template>
