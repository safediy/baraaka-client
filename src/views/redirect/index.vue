<script lang="ts" setup>
import { setIsTelegramBot, removeIsTelegramBot } from '@/utils/cache/local-storage'
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { decodeHexBrowser } from '@/utils'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const decodeParams = () => {
  try {
    console.log('route.params.encodedData', route.params.encodedData)

    return decodeHexBrowser(route.params.encodedData as string)
  } catch (error) {
    console.error(error)
    return null
  }
}

const initializeParams = (params: any) => {
  if (!params) return

  const { redirect, isTelegramBot, language } = params
  console.log('params', params)

  if (isTelegramBot) {
    setIsTelegramBot({ isTelegramBot })
  } else {
    removeIsTelegramBot()
  }

  if (language) userStore.setLanguage(language)

  router.replace(redirect)
}
onMounted(async () => {
  const params = decodeParams()
  initializeParams(params)
})
</script>

<template>
  <div id="app-loading" />
</template>
