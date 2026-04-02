<script lang="ts" setup>
import HomeDelivery from './homeDelivery.vue'
import Map from './map.vue'

const props = defineProps({
  mapType: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div>
    <HomeDelivery v-if="props.mapType === 'delivery'" />
    <Map v-else />
  </div>
</template>

<style lang="less" scoped></style>
