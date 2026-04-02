<script setup lang="ts">
import '../auth/index.css'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import TrackNumberList from '../home/components/TrackNumberList.vue'
import { useI18n } from 'vue-i18n'
import { RouteLocationNormalizedLoaded, useRoute } from 'vue-router'
import searchSvg from '@/views/map/images/search.svg?url'
import { eventBus } from '@/utils/eventBus'

const { t } = useI18n()
const route: RouteLocationNormalizedLoaded = useRoute()

const searchInput = ref()
const trackListRef = ref()

const telegramService = (window as any).Telegram

telegramService?.WebApp.ready()
telegramService?.WebApp.expand()

const trackingNumbers = computed(() => {
  const numbers = route.query.trackingNumbers
  if (!numbers) return []

  return String(numbers).split(',')
})

const search = reactive({
  trackingNumber: {
    $cont: ''
  }
})

onMounted(() => {
  if ('search' in route.query) {
    searchInput.value?.focus()
  }
})

onMounted(() => {
  eventBus.on('track-added', () => {
    trackListRef.value?.reloadOrders?.()
  })
})

onUnmounted(() => {
  eventBus.off('track-added')
})
</script>

<template>
  <section class="orders">
    <div class="client-container orders-wrapper">
      <div class="content-container">
        <div class="search-navbar">
          <!-- <el-icon class="search-icon">
            <Search />
          </el-icon> -->
          <img :src="searchSvg" :alt="searchSvg" />
          <input
            ref="searchInput"
            v-model="search.trackingNumber.$cont"
            type="text"
            :placeholder="t('searchByTrackNumber')"
          />
          <el-icon
            v-if="search.trackingNumber.$cont.length > 0"
            @click="search.trackingNumber.$cont = ''"
            class="clean-icon"
          >
            <Close />
          </el-icon>
        </div>
      </div>
      <div class="border" />
      <TrackNumberList ref="trackListRef" :queryTrackingNumbers="trackingNumbers" :search="search" />
    </div>
  </section>
</template>

<style scoped lang="scss">
@mixin f-style($fSize, $fWeight, $color) {
  font-size: $fSize;
  font-weight: $fWeight;
  color: $color;
}

.orders {
  width: 100%;
  background-color: #fff;
  height: 100%;
}

.search-navbar {
  display: flex;
  align-items: center;
  height: 48px;
  border-radius: 48px;
  padding: 0 0 0 14px;
  column-gap: 8px;
  background: #fff;
  margin: 10px 0;
  position: relative;
  border: 2px solid #e5e7eb;

  .search-icon {
    @include f-style(16px, 500, #9ca3af);
  }

  input {
    @include f-style(14px, 500, #111827);
    height: 100%;
    width: 100%;
    outline: none;
    border: none;
    background: #fff;
    border-top-right-radius: 48px;
    border-bottom-right-radius: 48px;

    &::placeholder {
      color: #6b7280;
    }
  }

  .clean-icon {
    position: absolute;
    right: 14px;
    cursor: pointer;
    font-size: 20px;
    color: #111827;
  }
}

@media only screen and (max-width: 770px) {
  .orders,
  .orders-wrapper {
    padding: 0;
  }

  .border {
    width: 100%;
    height: 1px;
    background-color: #f3f4f6;
  }

  .search-navbar {
    background-color: #f3f4f6;
    border: none;

    input {
      background-color: #f3f4f6;
      font-weight: 600;
    }
  }
}
</style>
