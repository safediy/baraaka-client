<script setup lang="ts">
import locationSvg from '@/views/map/images/location.svg?url'

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <button
    class="bg-white border-none text-[28px] flex items-center justify-center w-12 h-12 rounded-full overflow-hidden cursor-pointer active:opacity-80 shadow-md"
    @click="emit('click')"
  >
    <img :src="locationSvg" :alt="locationSvg" />
  </button>
</template>
