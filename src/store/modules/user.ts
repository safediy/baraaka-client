import { ref } from 'vue'
import store from '@/store'
import { defineStore } from 'pinia'
import { useTagsViewStore } from './tags-view'
import { useSettingsStore } from './settings'
import { getToken, removeToken, setToken } from '@/utils/cache/cookies'
import { resetRouter } from '@/router'
import { loginApi, logoutApi } from '@/api/login'
import clientService from '@/api/ClientService'
import i18n, { changeLocale } from '@/i18n'
import { setActiveLang } from '@/utils/cache/local-storage'
import { LocaleLanguage } from 'types/common'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(getToken() || '')
  const role = ref<string>('')
  const username = ref<string>('')
  const phone = ref<string>('')
  const clientId = ref<number>()
  const clientCode = ref<number>()
  const language = ref<LocaleLanguage>()
  const pvzInfo = ref()

  const tagsViewStore = useTagsViewStore()
  const settingsStore = useSettingsStore()

  /** 登录 */
  const login = async ({ username, password, companyId }: any) => {
    const res: any = await loginApi({ username, password, companyId })
    setToken(res.token)
    token.value = res.token
  }
  const otpLogin = async ({ phoneNumber, accessToken }: { phoneNumber: string; accessToken: string }) => {
    setToken(accessToken)
    token.value = accessToken
    phone.value = phoneNumber
  }

  const register = async (params: any) => {
    const res: any = await clientService.register(params)
    setToken(res.token)
    token.value = res.token
  }

  /** 获取用户详情 */
  const getInfo = async () => {
    const data = await clientService.getInfo()
    username.value = data.name
    clientCode.value = data.code
    phone.value = data.phoneNumber
    clientId.value = data.id
    language.value = data.language as LocaleLanguage
    i18n.global.locale.value = data.language as LocaleLanguage
    setActiveLang(data.language)
    pvzInfo.value = data.pvz
    role.value = 'CLIENT'
  }

  const updateClientDetails = async (params: any) => {
    const data: any = await clientService.updateDetails(params)
    username.value = data.name
    phone.value = data.phoneNumber
    console.log(data)
  }

  /** 模拟角色变化 */
  const changeRoles = async (role: string) => {
    const newToken = 'token-' + role
    token.value = newToken
    setToken(newToken)
    // 用刷新页面代替重新登录
    window.location.reload()
  }
  /** 登出 */
  const logout = () => {
    logoutApi()
    removeToken()
    token.value = ''
    role.value = ''
    resetRouter()
    _resetTagsView()
  }
  /** 重置 Token */
  const resetToken = () => {
    removeToken()
    token.value = ''
    role.value = ''
  }
  /** 重置 Visited Views 和 Cached Views */
  const _resetTagsView = () => {
    if (!settingsStore.cacheTagsView) {
      tagsViewStore.delAllVisitedViews()
      tagsViewStore.delAllCachedViews()
    }
  }

  const setLanguage = (newLanguage: LocaleLanguage) => {
    language.value = newLanguage
    changeLocale(newLanguage)
  }

  const getLanguage = () => {
    return language.value
  }

  return {
    token,
    role,
    clientId,
    pvzInfo,
    username,
    clientCode,
    phone,
    login,
    otpLogin,
    register,
    getInfo,
    updateClientDetails,
    changeRoles,
    logout,
    resetToken,
    language,
    setLanguage,
    getLanguage
  }
})

/** 在 setup 外使用 */
export function useUserStoreHook() {
  return useUserStore(store)
}
