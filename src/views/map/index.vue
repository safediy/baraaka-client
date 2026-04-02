<script lang="ts" setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { setLocalStorage, setSessianStorage, setTokenLocal } from '@/utils/cache/cookies'
import { useRoute, useRouter } from 'vue-router'

import pvzSvg from '@/views/map/images/pvz.webp?url'
import doorSvg from '@/views/map/images/door.webp?url'
import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'ServiceMap'
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const trackingNumber = computed(() => route.query?.trackingNumber)

const telegramService = window.Telegram

onMounted(() => {
  if (trackingNumber.value) {
    setSessianStorage('trackingNumber', trackingNumber.value as string)
  }

  const token: any = route.query.tokenKey
  const message: any = route.query.message

  if (token) {
    setTokenLocal(token as string)
    setLocalStorage('bot-message', message)
  }

  telegramService.WebApp.ready()
  telegramService.WebApp.expand()
  telegramService.WebApp.BackButton.show()

  // Back button click listener
  telegramService.WebApp.BackButton.onClick(() => {
    const hasHistory = window.history.state && window.history.state.back

    if (!hasHistory) {
      telegramService.WebApp.close()
    } else {
      router.back()
    }
  })
})
onUnmounted(() => {
  // Clean up the listener to prevent memory leaks
  telegramService.WebApp.BackButton.offClick()
})
</script>

<template>
  <div class="bg-white p-1 relative w-auto h-100vh max-w-600px mx-auto container">
    <ul class="m-16px p-0 grid gap-12px">
      <li class="list-none">
        <router-link
          to="/map"
          class="flex p-16px items-center gap-16px rounded-20px bg-gradient-radial-[134.14%_132.32%_at_2.08%_97.37%,#0663d2_0%,#044ca2_75.62%] no-underline relative justify-between"
        >
          <div class="flex w-full gap-16px items-center">
            <img :src="pvzSvg" :alt="pvzSvg" class="w-64px h-64px" />
            <div class="w-full">
              <h2 class="text-white text-16px font-500 leading-120% mb-8px">
                {{ t('delivery.pvz') }}
              </h2>
              <p class="text-white text-13px font-500 leading-120% opacity-35">
                {{ t('delivery.pvz.uzbekistan') }}
              </p>
            </div>
          </div>
          <el-icon>
            <ArrowRightBold class="text-white opacity-35" />
          </el-icon>
          <svg
            class="absolute right-6px bottom-6px"
            width="62"
            height="20"
            viewBox="0 0 62 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 14C0 6.26801 6.26801 0 14 0H62V6C62 13.732 55.732 20 48 20H0V14Z" fill="white" />
            <path
              d="M13.14 14V5.6H16.812C18.864 5.6 19.908 6.296 19.908 7.676C19.908 8.828 19.164 9.56 17.844 9.668V9.692C19.308 9.776 20.148 10.532 20.148 11.792C20.148 13.256 19.032 14 16.848 14H13.14ZM16.56 9.188C17.7 9.188 18.336 8.732 18.336 7.928C18.336 7.172 17.808 6.836 16.596 6.836H14.676V9.188H16.56ZM14.676 12.764H16.572C17.976 12.764 18.552 12.404 18.552 11.528C18.552 10.676 18 10.352 16.572 10.352H14.676V12.764ZM25.2728 14.168C22.9328 14.168 21.5648 12.812 21.5648 10.892C21.5648 8.948 22.9328 7.628 25.0088 7.628C27.1328 7.628 28.3088 8.912 28.3088 10.952L23.1608 11.66C23.4248 12.476 24.1328 12.932 25.3688 12.932C26.1968 12.932 27.0248 12.752 27.8528 12.452V13.7C27.0728 14 26.3168 14.168 25.2728 14.168ZM23.0528 10.832L26.8688 10.304C26.7608 9.356 26.1488 8.864 25.0448 8.864C23.7368 8.864 23.0648 9.56 23.0528 10.832ZM29.8116 16.4V7.796H31.2636L31.0956 9.596H31.1196C31.4916 8.372 32.5236 7.628 33.8796 7.628C35.6676 7.628 36.9156 8.948 36.9156 10.856C36.9156 12.824 35.5116 14.168 33.4836 14.168C32.6316 14.168 31.9356 13.928 31.2636 13.4V16.4H29.8116ZM33.3516 12.908C34.6596 12.908 35.4276 12.164 35.4276 10.892C35.4276 9.632 34.6596 8.888 33.3516 8.888C32.0316 8.888 31.2636 9.632 31.2636 10.892C31.2636 12.164 32.0316 12.908 33.3516 12.908ZM40.9797 14.168C39.3717 14.168 38.4717 13.184 38.4717 11.324V7.796H39.9237V11.144C39.9237 12.308 40.5117 12.908 41.5797 12.908C42.7437 12.908 43.4757 12.14 43.4757 10.988V7.796H44.9277V14H43.4757L43.6437 12.2H43.6197C43.2837 13.448 42.3357 14.168 40.9797 14.168ZM46.8506 14V5.6L48.3026 5.324V14H46.8506Z"
              fill="#044CA2"
            />
          </svg>
        </router-link>
      </li>
      <li class="list-none">
        <router-link
          to="/homeDelivery"
          class="flex p-16px items-center gap-16px rounded-20px bg-gradient-radial-[134.14%_132.32%_at_2.08%_97.37%,#0663d2_0%,#044ca2_75.62%] no-underline relative justify-between"
        >
          <div class="flex w-full gap-16px items-center">
            <img :src="doorSvg" :alt="doorSvg" class="w-64px h-64px" />
            <div>
              <h2 class="text-white text-16px font-500 leading-120% mb-8px">
                {{ t('delivery.home') }}
              </h2>
              <p class="text-white text-13px font-500 leading-120% opacity-35 w-full mt-5px">
                {{ t('delivery.home.tashkent') }}
              </p>
            </div>
          </div>
          <el-icon>
            <ArrowRightBold class="text-white opacity-35" />
          </el-icon>
          <svg
            class="absolute right-6px bottom-6px"
            width="62"
            height="20"
            viewBox="0 0 62 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 14C0 6.26801 6.26801 0 14 0H62V6C62 13.732 55.732 20 48 20H0V14Z" fill="white" />
            <path
              d="M13.14 14V5.6H16.812C18.864 5.6 19.908 6.296 19.908 7.676C19.908 8.828 19.164 9.56 17.844 9.668V9.692C19.308 9.776 20.148 10.532 20.148 11.792C20.148 13.256 19.032 14 16.848 14H13.14ZM16.56 9.188C17.7 9.188 18.336 8.732 18.336 7.928C18.336 7.172 17.808 6.836 16.596 6.836H14.676V9.188H16.56ZM14.676 12.764H16.572C17.976 12.764 18.552 12.404 18.552 11.528C18.552 10.676 18 10.352 16.572 10.352H14.676V12.764ZM25.2728 14.168C22.9328 14.168 21.5648 12.812 21.5648 10.892C21.5648 8.948 22.9328 7.628 25.0088 7.628C27.1328 7.628 28.3088 8.912 28.3088 10.952L23.1608 11.66C23.4248 12.476 24.1328 12.932 25.3688 12.932C26.1968 12.932 27.0248 12.752 27.8528 12.452V13.7C27.0728 14 26.3168 14.168 25.2728 14.168ZM23.0528 10.832L26.8688 10.304C26.7608 9.356 26.1488 8.864 25.0448 8.864C23.7368 8.864 23.0648 9.56 23.0528 10.832ZM29.8116 16.4V7.796H31.2636L31.0956 9.596H31.1196C31.4916 8.372 32.5236 7.628 33.8796 7.628C35.6676 7.628 36.9156 8.948 36.9156 10.856C36.9156 12.824 35.5116 14.168 33.4836 14.168C32.6316 14.168 31.9356 13.928 31.2636 13.4V16.4H29.8116ZM33.3516 12.908C34.6596 12.908 35.4276 12.164 35.4276 10.892C35.4276 9.632 34.6596 8.888 33.3516 8.888C32.0316 8.888 31.2636 9.632 31.2636 10.892C31.2636 12.164 32.0316 12.908 33.3516 12.908ZM40.9797 14.168C39.3717 14.168 38.4717 13.184 38.4717 11.324V7.796H39.9237V11.144C39.9237 12.308 40.5117 12.908 41.5797 12.908C42.7437 12.908 43.4757 12.14 43.4757 10.988V7.796H44.9277V14H43.4757L43.6437 12.2H43.6197C43.2837 13.448 42.3357 14.168 40.9797 14.168ZM46.8506 14V5.6L48.3026 5.324V14H46.8506Z"
              fill="#044CA2"
            />
          </svg>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss"></style>
