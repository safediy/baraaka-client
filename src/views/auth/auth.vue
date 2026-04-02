<script setup lang="ts">
import Login from '@/views/auth/login.vue'
import { useTitle } from '../../hooks/useTitle'
import { useI18n } from 'vue-i18n'
import { watchEffect } from 'vue'
const { t } = useI18n()

watchEffect(() => {
  const title = `iPost  - ${t('chinaToUzDelivery')}`
  useTitle().setTitle(title)
})
</script>

<template>
  <Login />
  <template class="card-footer">
    <el-text class="terms-text" tag="p">© 2024 MCHJ «ABUSAXIY». Barcha huquqlar himoyalangan</el-text>
  </template>
</template>
