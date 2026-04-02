<script lang="ts" setup>
import { reactive } from 'vue'
import HeaderBanner from '../HeaderBanner.vue'
import '@/views/auth/index.css'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import searchSvg from '@/views/map/images/search.svg?url'

const { t } = useI18n()
const router = useRouter()
const search = reactive({
  trackingNumber: {
    $cont: ''
  }
})

const handleToOrderPath = () => {
  router.push({ path: '/orders', query: { search: null } })
}
</script>

<template>
  <section class="home">
    <section class="content-container home-wrapper">
      <div class="home-container">
        <div class="search-navbar">
          <img :src="searchSvg" :alt="searchSvg" />
          <input
            @click="handleToOrderPath"
            v-model.trim="search.trackingNumber.$cont"
            type="text"
            :placeholder="t('searchByTrackNumber')"
          />
        </div>
        <HeaderBanner />
      </div>
    </section>
  </section>
</template>

<style scoped lang="scss">
@mixin f-style($fSize, $fWeight, $color) {
  font-size: $fSize;
  font-weight: $fWeight;
  color: $color;
}

.home {
  background-color: #ffffff;
  width: 100%;
  height: 100% !important;
}

.home-container {
  max-width: 600px;
  margin: 0 auto;
}

.home-wrapper {
  width: 100%;
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
    @include f-style(17px, 500, #9ca3af);
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
      color: #9ca3af;
    }
  }
}

@media only screen and (max-width: 770px) {
  .home-wrapper {
    overflow: hidden;
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
