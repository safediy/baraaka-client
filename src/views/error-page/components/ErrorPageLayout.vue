<script lang="ts" setup>
const telegramService = window.Telegram

const handleBackButton = () => {
  telegramService.WebApp.close()
}

console.log(window.location)
</script>

<template>
  <div class="error-page">
    <div class="error-page-svg">
      <slot />
    </div>
    <p>
      Kechirasiz, siz tanlagan havola eskirgan yoki mavjud emas. Iltimos, aniq havoladan foydalaning yoki orqaga qaytib
      ko‘ring.
    </p>
    <router-link class="" to="/">
      <el-button type="primary" @click="handleBackButton">Orqaga qaytish</el-button>
    </router-link>
  </div>
</template>
<style lang="scss" scoped>
.error-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 15px;

  &-svg {
    width: 400px;
    margin-bottom: 50px;
  }

  p {
    color: var(--main-label-secondary);
    /* footnote/medium */
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: 150%;
    margin: 0;
    max-width: 650px;
    text-align: center;
    /* 15.6px */
  }
}
</style>
