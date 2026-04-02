<template>
  <component
    :is="useDrawer ? 'el-drawer' : 'el-dialog'"
    v-model="dialogVisible"
    :title="props.title"
    class="custom-dialog"
    :style="styleToUse"
    v-bind="useDrawer ? { direction: 'btt', size: size || '90%' } : {}"
  >
    <template #header="{ titleId, titleClass }">
      <div v-if="useDrawer" class="dashLine" @click="dialogVisible = false" />
      <h4 :id="titleId" :class="titleClass">{{ title }}</h4>
    </template>
    <slot />
  </component>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  modelValue: boolean
  title?: string
  size?: string
  positionStyle?: Object
  radiusDisabled?: boolean
  scrollHide?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// Responsive useDrawer logic
const useDrawer = ref(window.innerWidth <= 770)

const handleResize = () => {
  useDrawer.value = window.innerWidth <= 770
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const radiusDisabled = computed(() => props.radiusDisabled ?? false)

const dialogStyle = computed(() => ({
  maxWidth: useDrawer.value ? '100%' : '600px',
  margin: useDrawer.value ? '0 auto' : '5% auto',
  padding: '0 16px 16px',
  overflow: !useDrawer.value && props.scrollHide ? 'visible' : 'auto',
  borderRadius: radiusDisabled.value ? '0' : useDrawer.value ? '24px 24px 0 0' : '24px'
}))

const styleToUse = computed(() => {
  if (!useDrawer.value && props.positionStyle) {
    return props.positionStyle
  }
  return dialogStyle.value
})
</script>

<style lang="scss" scoped>
.custom-dialog {
  position: relative;

  .dashLine {
    width: 64px;
    height: 4px;
    background: #e5e7eb;
    border-radius: 4px;
    position: absolute;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    cursor: pointer;
  }
}
</style>
