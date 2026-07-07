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
    // CLI-08: do not log encodedData (may carry redirect/session-shaped data).
    return decodeHexBrowser(route.params.encodedData as string)
  } catch (error) {
    console.error(error)
    return null
  }
}

// CLI-08: only allow same-origin, relative in-app redirect targets. This prevents
// open-redirect / javascript: URL abuse via the encoded `redirect` param.
const safeRedirect = (redirect: unknown): string => {
  if (typeof redirect !== 'string' || redirect.length === 0) return '/'
  // Must be an app-relative path ("/foo"), never a protocol-relative ("//host")
  // or absolute URL ("https://…", "javascript:…").
  if (!redirect.startsWith('/') || redirect.startsWith('//')) return '/'
  return redirect
}

const initializeParams = (params: any) => {
  if (!params) return

  // CLI-08: do not log decoded params (may contain redirect/session-shaped data).
  const { redirect, isTelegramBot, language } = params

  if (isTelegramBot) {
    setIsTelegramBot({ isTelegramBot })
  } else {
    removeIsTelegramBot()
  }

  if (language) userStore.setLanguage(language)

  router.replace(safeRedirect(redirect))
}
onMounted(async () => {
  const params = decodeParams()
  initializeParams(params)
})
</script>

<template>
  <div id="app-loading" />
</template>
