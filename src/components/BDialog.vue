<script setup lang="ts">
import { ref, watch } from 'vue'

defineOptions({
  // 命名当前组件
  name: 'BDialog'
})

const props = defineProps({
  dialogVisible: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  width: {
    type: String,
    default: '30%'
  }
})

const emits = defineEmits(['confirm', 'cancel'])
const dialogVisible = ref(props.dialogVisible)
const handleConfirm = () => {
  emits('confirm')
}

const handleCancel = () => {
  emits('cancel')
}

watch(
  () => props.dialogVisible,
  (val) => {
    dialogVisible.value = val
  }
)
</script>

<template>
  <el-dialog v-model="dialogVisible" :title="title" :width="width" @close="handleCancel" center :show-close="false">
    <slot name="form" />

    <template #footer>
      <el-button type="primary" @click="handleConfirm">{{ $t('confirm') }}</el-button>
      <el-button @click="handleCancel">{{ $t('cancel') }}</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss"></style>
