import router from '@/router'
import { useUserStoreHook } from '@/store/modules/user'
import { usePermissionStoreHook } from '@/store/modules/permission'
import { setRouteChange } from '@/hooks/useRouteListener'
import { useTitle } from '@/hooks/useTitle'
import { getToken, getTokenLocal } from '@/utils/cache/cookies'
import routeSettings from '@/config/route'
import isWhiteList from '@/config/white-list'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { removeConfigLayout } from '@/utils/cache/local-storage'
const { setTitle } = useTitle()

NProgress.configure({ showSpinner: false })
let isError = false
router.beforeEach(async (to, _from, next) => {
  NProgress.start()

  const userStore = useUserStoreHook()
  const permissionStore = usePermissionStoreHook()
  const token = getToken() ?? getTokenLocal()
  const isTelegram = window.Telegram.WebApp.initData

  if (!token) {
    if (isTelegram && !isError) {
      try {
        isError = false
        removeConfigLayout()
        await userStore.getInfo()
      } catch (error) {
        next('/login')
        isError = true
        return
      }
      next()
      return
    } else {
      if (isWhiteList(to)) {
        next()
        return
      }
      next('/login')
      return
    }
  }

  if (to.path === '/login') {
    next({ path: '/' })
    return
  }

  if (to.path === '/profil' && !userStore.token) {
    next({ path: '/login' })
    return
  }

  if (userStore.role) {
    next()
    return
  }

  try {
    await userStore.getInfo()

    routeSettings.dynamic ? permissionStore.setRoutes(userStore.role) : permissionStore.setAllRoutes()

    permissionStore.addRoutes.forEach((route) => router.addRoute(route))

    if (!userStore.username) {
      next({ path: '/my/profile' })
      return
    }

    next({ ...to, replace: true })
  } catch (err) {
    userStore.resetToken()
    next('/404')
  }
})

router.afterEach((to) => {
  setRouteChange(to)
  setTitle(to.meta.title)
  NProgress.done()
})
