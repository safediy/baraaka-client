<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import uzFlag from '@/assets/layouts/uzFlag.svg'
import ruFlag from '@/assets/layouts/ruFlag.svg'
import engFlag from '@/assets/layouts/engFlag.svg'
import chinaFlag from '@/assets/layouts/chinaFlag.svg'
import { useUserStore } from '@/store/modules/user'
import ClientService from '@/api/ClientService'
import { getActiveLang } from '@/utils/cache/local-storage'

const { t, locale } = useI18n()
const userStore = useUserStore()

const dialogVisible = ref(false)
const loading = ref(false)

const selectedLanguage = ref(userStore.language || getActiveLang())

const languages = [
  { label: "O'zbekcha", value: 'uz', flag: uzFlag },
  { label: 'Русский', value: 'ru', flag: ruFlag },
  { label: 'English', value: 'en', flag: engFlag },
  { label: '中国人', value: 'zh', flag: chinaFlag }
]

const view = () => {
  selectedLanguage.value = locale.value
  dialogVisible.value = true
}

const close = () => {
  dialogVisible.value = false
}

const handleSelectLanguage = async () => {
  loading.value = true
  await new Promise((resolve) => setTimeout(resolve, 500))
  await ClientService.updateClientLang({
    id: userStore.clientId,
    language: selectedLanguage.value
  })
  userStore.setLanguage(selectedLanguage.value)
  loading.value = false
  close()
}

defineExpose({
  view,
  close
})
</script>

<template>
  <el-dialog
    top="30vh"
    v-model="dialogVisible"
    :title="t('languageSelect')"
    style="max-width: 350px; width: 100%; border-radius: 20px"
    :close-on-click-modal="false"
  >
    <div class="dialog-content">
      <el-radio-group v-model="selectedLanguage" class="radio-items">
        <el-radio class="select-radio" v-for="lang in languages" :key="lang.value" :label="lang.value">
          <img :src="lang.flag" style="width: 20px; margin-right: 8px" />
          <span>{{ lang.label }}</span>
        </el-radio>
      </el-radio-group>

      <el-button class="select-btn" @click="handleSelectLanguage" :loading="loading">
        {{ t('save') }}
      </el-button>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
@mixin f-style($f-Size, $fWeight, $color) {
  font-size: $f-Size;
  font-weight: $fWeight;
  color: $color;
}

.radio-items {
  margin-top: 0px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
}

.select-radio {
  flex-direction: column;
  flex-direction: row-reverse;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 25px 8px !important;
  border-radius: 15px;
  background-color: #f3f4f6;
  margin: 0;
}

:deep(.el-radio-group) {
  width: 100%;
}

:deep(.el-radio__label) {
  display: flex;
  align-items: end;
  padding-left: 0 !important;

  span {
    @include f-style(16px, 500, #111827);
  }

  img {
    width: 25px !important;
    height: 25px !important;
  }
}

.dialog-content {
  margin-top: 20px;

  p {
    @include f-style(14px, 500, #9ca3af);
    margin-bottom: 24px;
    line-height: 20px;
  }
}

.checkbox,
:deep(.el-checkbox__inner) {
  background: var(--light-color);
  border-radius: 6px;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.checkbox :deep(.el-checkbox__inner::after) {
  border-color: #fff;
  margin: 0.24rem 3.6px;
  border-width: 2px;
}

.checkbox :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background: #0a0a0a;
}

.select-btn {
  width: 100%;
  margin-top: 24px;
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 16px !important;
  background-color: #030712;
  @include f-style(15px, 500, #ffffff);
  padding: 0;
}

.notification_1 {
  width: 100% !important;
  background-color: #111827e5 !important;
  border-radius: 20px !important;
  padding: 16px 24px !important;
  display: none !important;
}

.el-notification.right {
  right: 16px;
  background: gold !important;
}
</style>
