<script lang="ts" setup>
import Navbar from '@/layouts/components/Navbar/Navbar.vue'
import '../auth/index.css'
import { RouterView, useRoute } from 'vue-router'
import { getIsTelegramBot } from '@/utils/cache/local-storage'
import { watch } from 'vue'
import { useTitle } from '@/hooks/useTitle'
import { useI18n } from 'vue-i18n'

const layoutSettings = getIsTelegramBot()

const route = useRoute()
const { t, locale } = useI18n()

watch(
  [route, locale],
  () => {
    const title = `${t('personalAccount')} - iPost`
    useTitle().setTitle(title)
  },
  { immediate: true }
)
</script>

<template>
  <section class="home">
    <Navbar />
    <RouterView />
    <!-- <el-footer class="home-footer">
      <el-text class="footer-text" tag="p" :style="{ fontSize: '14px' }">
        {{ t('allRightsReserved') }}
      </el-text>
    </el-footer> -->
  </section>
</template>

<style scoped lang="scss">
@mixin f-style($fSize, $fWeight, $color) {
  font-size: $fSize;
  font-weight: $fWeight;
  color: $color;
}

.home-footer {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.footer-text {
  @include f-style(13px, 400, #9ca3af);
}

.home {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
}
</style>
