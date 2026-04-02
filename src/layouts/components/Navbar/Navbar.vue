<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ComputedRef, ref } from 'vue'
import ChatSvg from '@/assets/svg/chat.svg'
import UserSvg from '@/assets/svg/user.svg'
import OrderSvg from '@/assets/svg/order.svg'
import HomeSvg from '@/assets/svg/home.svg?url'
import uzFlag from '@/assets/layouts/uzFlag.svg'
import ruFlag from '@/assets/layouts/ruFlag.svg'
import engFlag from '@/assets/layouts/engFlag.svg'
import chinaFlag from '@/assets/layouts/chinaFlag.svg'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import Logo from '@/assets/layouts/logo.svg'
import AddTrackNumberDialog from './AddTrackNumberDialog.vue'
import ClientService from '@/api/ClientService'
import { getActiveLang, getIsTelegramBot } from '@/utils/cache/local-storage'
import AddSvg from '@/assets/svg/add.svg'
import { LocaleLanguage } from 'types/common'
const { t } = useI18n()
import HeadSetSvg from '@/assets/svg/headset.svg'
const userStore = useUserStore()
const isTelegramBot = getIsTelegramBot()

const route = useRoute()
const router = useRouter()
const addTrackNumberDialog = ref()
const language = ref(userStore.language || getActiveLang() || 'uz')

const languages = ref([
  { label: 'O’zbekcha', value: 'uz', flag: uzFlag },
  { label: 'Русский', value: 'ru', flag: ruFlag },
  { label: 'English', value: 'en', flag: engFlag },
  { label: '中国人', value: 'zh', flag: chinaFlag }
])

const isNavbarSecret: ComputedRef<boolean> = computed(() => {
  return !['login', 'pickup-points'].some((path) => route.path.includes(path))
})

const changeLanguage = async (lang: LocaleLanguage) => {
  userStore.setLanguage(lang)
  if (userStore?.token) {
    await ClientService.updateClientLang({
      id: userStore.clientId,
      language: language
    })
  }
}
const helpLink = computed(() => {
  const message = t('helpMessage', { code: userStore.clientCode })
  // return `https://t.me/iPost_help?text=${encodeURIComponent(message)}`
  return `https://t.me/iPost_help_bot`
  // })
})

const routes = [
  { path: '/home', icon: HomeSvg, label: 'main.page' },
  { path: '/orders', icon: OrderSvg, label: 'orders' },
  {
    path: helpLink.value,
    icon: HeadSetSvg,
    label: 'help',
    external: true
  },
  { path: '/profil', icon: UserSvg, label: 'personalProfile' }
]

// const createFilter = (queryString: string) => {
//   return (location: LocationItem) => {
//     return location.address.toLowerCase().indexOf(queryString.toLowerCase()) !== -1
//   }
// }
// const querySearch = (queryString: string, cb: any) => {

//   locationsData.value =
//     queryString || querySearch.length == 0 ? locationsData.value.filter(createFilter(queryString)) : props?.data
//   cb([])
// }

// const handleToMap = () => {
//   emit('closeSheet', false)
// }
</script>

<template>
  <nav class="navbar">
    <nav class="client-navbar client-container">
      <div @click="router.push('/')" class="logo">
        <img class="navbar-logo" :src="Logo" />
      </div>

      <div class="navbar__routes-list">
        <template v-for="(item, index) in routes" :key="index">
          <router-link v-if="!item.external" :to="item.path" activeClass="active-link" class="item-link">
            <img :src="item.icon" class="link-icon" />
            <span> {{ t(item.label) }}</span>
          </router-link>
          <a v-else activeClass="active-link" :href="helpLink" target="_blank" class="item-link">
            <el-icon class="item-icon">
              <img :src="item.icon" class="link-icon" />
            </el-icon>
            <span>{{ t(item.label) }}</span>
          </a>
        </template>
      </div>

      <div class="navbar-actions">
        <el-tooltip v-if="isNavbarSecret" :content="t('add.new')" placement="top">
          <div @click="addTrackNumberDialog.show()" class="add-button">
            <img :src="AddSvg" />
          </div>
        </el-tooltip>
        <template v-if="route.path.includes('auth')">
          <el-link class="help-service" :href="helpLink" target="_blank">{{ t('helpService') }}</el-link>
          <el-link class="help-service help-service-call" :href="helpLink" target="_blank"
            ><el-icon> <Phone /> </el-icon
          ></el-link>
        </template>
        <el-select class="lang-select" v-model="language" @change="changeLanguage" size="large" style="width: 100px">
          <template #prefix>
            <img :src="languages.find((lang) => lang.value === language)?.flag" width="20" height="20" />
            <span style="margin-left: 5px">
              {{ languages.find((lang) => lang.value === language)?.value.toUpperCase() }}
            </span>
          </template>

          <el-option v-for="lang in languages" :key="lang.value" :label="lang.label" :value="lang.value">
            <div class="lang-option" style="display: flex; align-items: center; gap: 8px">
              <img :src="lang.flag" width="20" />
              <el-text tag="span" style="font-size: 14px; font-weight: 500; color: #111827">
                {{ lang.label }}
              </el-text>
              <el-icon v-if="language === lang.value">
                <Check />
              </el-icon>
            </div>
          </el-option>
        </el-select>
      </div>
    </nav>

    <!-- Media Navbar -->
    <div v-if="isNavbarSecret" class="media-navbar">
      <div class="media-navbar-lists">
        <router-link to="/home" activeClass="media-active-link" class="item-link">
          <el-icon class="item-icon">
            <img :src="HomeSvg" class="link-icon" />
          </el-icon>
          {{ t('home') }}
        </router-link>
        <router-link to="/orders" activeClass="media-active-link" class="item-link">
          <el-icon class="item-icon">
            <img :src="OrderSvg" class="link-icon" />
          </el-icon>
          {{ t('order') }}
        </router-link>
        <el-button @click="addTrackNumberDialog.show()" class="add-btn">
          <img :src="AddSvg" alt="" />
        </el-button>
        <a :href="`https://t.me/iPost_help_bot`" target="_blank" class="item-link">
          <el-icon class="item-icon">
            <img :src="ChatSvg" class="link-icon" />
          </el-icon>
          {{ t('help') }}
        </a>
        <router-link to="/profil" activeClass="media-active-link" class="item-link">
          <el-icon class="item-icon">
            <img :src="UserSvg" class="link-icon" />
          </el-icon>
          {{ t('profile') }}
        </router-link>
      </div>
    </div>
    <AddTrackNumberDialog ref="addTrackNumberDialog" />
  </nav>
</template>

<style lang="scss" scoped>
@mixin f-style($fSize, $fWeight, $color) {
  font-size: $fSize;
  font-weight: $fWeight;
  color: $color;
}

.navbar {
  border-bottom: 1px solid #f3f4f6;
  position: sticky;
  top: 0;
  background-color: #fff;
  z-index: 99;
}

.logo {
  cursor: pointer;
}

:deep(.el-select__popper) {
  border-radius: 16px !important;
  max-width: 200px;
}

.el-select-dropdown {
  max-width: 13px !important;
  width: 100% !important;
  width: 14px !important;
}

.navbar-logo {
  width: 85px;
  height: 44px;
  object-fit: contain;
}

:deep(.el-select__wrapper) {
  outline: none;
  box-shadow: none;
  border-radius: 12px;
}

.client-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: 0.8rem;
  padding: 20px;
}

.navbar__routes-list {
  display: flex;
  align-items: center;
  column-gap: 8px;

  .item-link {
    text-decoration: none;
    column-gap: 11px;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    border-radius: 32px !important;

    span {
      @include f-style(15px, 500, #6b7280);
      margin-top: 3px;
    }

    .link-icon {
      width: 22px;
      height: 22px;
      object-fit: contain;
      filter: brightness(0) saturate(100%) invert(45%) sepia(4%) saturate(1237%) hue-rotate(179deg) brightness(99%)
        contrast(96%);
    }
  }

  .active-link {
    background-color: #e5e7eb !important;

    span {
      @include f-style(15px, 500, #030712 !important);
    }

    .link-icon {
      filter: brightness(0) saturate(100%) invert(1%) sepia(0%) saturate(202%) hue-rotate(92deg) brightness(103%)
        contrast(90%);
    }
  }
}

.pickup-header {
  display: flex;
  align-items: center;
  // justify-content: center;
  gap: 8px;

  .back-link {
    background: transparent;
    border: none;
    @include f-style(20px, #9ca3af, 500);
  }

  .search-input {
    max-width: 500px;
    width: 100%;
    height: 48px !important;
    border-radius: 48px;
  }
}

.navbar-actions {
  display: flex;
  align-items: center;
  column-gap: 10px;

  .help-service {
    border-radius: 12px;
    background-color: #030712;
    @include f-style(15px, 500, #fff);
    padding: 10px 20px;
  }

  .help-service-call {
    display: none;
    border-radius: 50%;
    font-size: 18px;
    width: 14px;
  }

  .add-button {
    border-radius: 50%;
    background-color: #030712;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    cursor: pointer;
  }
}

:deep(.el-select__prefix) {
  display: flex;
  align-items: flex-start;
}

:deep(.el-select__prefix span) {
  color: #030712 !important;
}

.media-navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: none;
  z-index: 110 !important;
  background-color: #fff;
  border-top: 1px solid #f3f4f6;
  box-shadow: 0px -3px 8px 0px #11182708;
}

.media-navbar-lists {
  display: grid;
  justify-content: space-evenly;
  align-items: center !important;
  grid-template-columns: repeat(5, 10%);
  width: 100%;
  padding: 7px 0 15px;
  overflow-x: hidden;

  .media-active-link {
    color: #111827 !important;
    font-weight: 600 !important;

    .link-icon {
      filter: brightness(0) saturate(100%) invert(1%) sepia(0%) saturate(202%) hue-rotate(92deg) brightness(103%)
        contrast(90%);
    }
  }

  .item-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    @include f-style(16px, 500, #9ca3af);

    .link-icon {
      width: 24px;
      height: 24px;
    }
  }

  :deep(.el-link__inner) {
    display: flex;
    gap: 5px;
    flex-direction: column;
  }

  .active-link {
    color: #030712;

    .link-icon {
      filter: invert(5%) sepia(16%) saturate(746%) hue-rotate(205deg) brightness(50%) contrast(101%);
    }
  }

  .add-btn {
    border-radius: 50%;
    background-color: #030712;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    justify-self: center;
    align-self: center;
  }
}

@media only screen and (max-width: 1094px) {
  .navbar-logo {
    max-width: 140px;
    height: 46px;
  }

  .client-navbar {
    column-gap: 1rem;
    padding: 20px;
  }

  .navbar__routes-list {
    column-gap: 12px;

    .item-link {
      @include f-style(15px, 500, #6b7280);
      column-gap: 6px;
      padding: 8px 14px;

      .item-icon {
        font-size: 17px;
        margin-bottom: 0px;
      }
    }
  }

  .navbar-actions {
    column-gap: 10px;

    .help-service {
      @include f-style(14px, 500, #fff);
      padding: 10px 18px;
    }
  }
}

@media only screen and (max-width: 994px) {
  .navbar-logo {
    max-width: 140px;
    height: 46px;
  }

  .navbar__routes-list {
    column-gap: 6px;

    .item-link {
      @include f-style(15px, 500, #6b7280);
      column-gap: 6px;

      .item-icon {
        font-size: 15px;
        margin-bottom: 0px;
      }
    }
  }

  .navbar-actions {
    column-gap: 10px;

    .help-service {
      display: none;
    }

    .help-service-call {
      display: flex;
    }
  }
}

@media only screen and (max-width: 926px) {
  .navbar-logo {
    max-width: 130px;
    height: 44px;
  }

  .navbar__routes-list {
    column-gap: 12px;

    .item-link {
      @include f-style(15px, 500, #6b7280);
      column-gap: 6px;
    }
  }

  .navbar-actions {
    column-gap: 10px;

    .help-service {
      display: none;
    }

    .help-service-call {
      display: flex;
    }
  }

  :deep(.el-select__prefix span) {
    display: none;
  }

  :deep(.el-select__wrapper) {
    width: 80px;
  }

  :deep(.el-select__prefix img) {
    width: 27px;
    height: 27px;
    object-fit: contain;
  }

  :deep(.el-select__suffix .el-icon svg) {
    width: 1.2rem;
    height: 1.2rem;
  }
}

@media only screen and (max-width: 846px) {
  .navbar-logo {
    max-width: 115px;
    height: 44px;
  }

  .navbar__routes-list {
    column-gap: 8px;

    .item-link {
      @include f-style(14px, 500, #6b7280);
    }
  }

  .navbar-actions {
    column-gap: 6px;

    .help-service-call {
      display: flex;
    }

    .add-button {
      width: 33px;
      height: 33px;
    }
  }

  :deep(.el-select__prefix span) {
    display: none;
  }

  :deep(.el-select__prefix img) {
    width: 27px;
    height: 27px;
    object-fit: contain;
  }

  :deep(.el-select__suffix .el-icon svg) {
    width: 1.2rem;
    height: 1.2rem;
  }
}

@media only screen and (max-width: 770px) {
  .client-navbar {
    display: none;
  }

  .media-navbar {
    display: flex;
  }

  .navbar {
    padding-top: 0rem !important;
    border: none;
  }
}

@media only screen and (max-width: 480px) {
  .navbar {
    padding-bottom: 0;
    margin-bottom: 0;
  }

  .media-navbar-lists {
    justify-content: space-around;

    .item-link {
      gap: 8px;
      @include f-style(14px, 500, #9ca3af);

      .link-icon {
        width: 24px;
        height: 24px;
      }
    }

    :deep(.el-link__inner) {
      display: flex;
      gap: 5px;
      flex-direction: column;
    }

    .add-btn {
      @include f-style(18px, 500, #fff);
      width: 48px;
      height: 48px;
    }
  }
}

@media only screen and (max-width: 374px) {
  .media-navbar-lists {
    .item-link {
      @include f-style(14px, 500, #9ca3af);
      // .link-icon {
      //   width: 23px;
      //   height: 23px;
      // }
    }

    :deep(.el-link__inner) {
      display: flex;
      gap: 5px;
      flex-direction: column;
    }

    .add-btn {
      @include f-style(17px, 500, #fff);
      width: 44px;
      height: 44px;
    }
  }
}
</style>
