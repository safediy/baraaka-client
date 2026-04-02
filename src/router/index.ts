import { createRouter, type RouteRecordRaw } from 'vue-router'
import { flatMultiLevelRoutes, history } from './helper'
import routeSettings from '@/config/route'
const Layouts = () => import('@/layouts/index.vue')

/**
 * 常驻路由
 * 除了 redirect/403/404/login 等隐藏页面，其他页面建议设置 Name 属性
 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
    component: () => import('@/views/home/Home.vue'),
    meta: {
      hidden: true
    },
    children: [
      {
        path: '/home',
        name: 'Home',
        component: () => import('@/views/home/components/main/Main.vue')
      },
      {
        path: 'pickup-points',
        name: 'PickupPoints',
        component: () => import('@/views/pickup-points/PickupPoints.vue')
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/orders/Orders.vue')
      },
      {
        path: 'promoCode',
        name: 'PromoCode',
        component: () => import('@/views/promo-codes/PromoCodeDialog.vue')
      },
      {
        path: 'profil',
        name: 'Profil',
        component: () => import('@/views/profile/Profile.vue')
      }
    ]
  },
  {
    path: '/redirect/:encodedData',
    component: () => import('@/views/redirect/index.vue'),
    meta: {
      hidden: true
    }
  },
  {
    path: '/tgWebAppData=:telegramData(.*)',
    redirect: '/'
  },
  {
    path: '/403',
    component: () => import('@/views/error-page/403.vue'),
    meta: {
      hidden: true
    }
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404.vue'),
    meta: {
      hidden: true
    },
    alias: '/:pathMatch(.*)*'
  },
  {
    path: '/login',
    component: () => import('@/views/auth/auth.vue'),
    name: 'Login',
    meta: {
      hidden: true
    }
  },
  {
    path: '/register',
    component: () => import('@/views/auth/NameDetails.vue'),
    name: 'Register',
    meta: {
      hidden: true
    }
  },
  {
    path: '/serviceMap/:trackingNumber?',
    component: () => import('@/views/map/index.vue'),
    name: 'ServiceMap',
    meta: {
      hidden: true
    }
  },
  {
    path: '/map',
    component: () => import('@/views/map/map.vue'),
    name: 'Map',
    meta: {
      hidden: true
    },
    props: true
  },
  {
    path: '/homeDelivery',
    component: () => import('@/views/map/homeDelivery.vue'),
    name: 'HomeDelivery',
    meta: {
      hidden: true
    }
  },
  {
    path: '/merge-waybill',
    component: () => import('@/views/map/mergeWaybill.vue'),
    name: 'MergeWaybill',
    meta: {
      hidden: true
    }
  },
  {
    path: '/searchList',
    component: () => import('@/views/map/searchList.vue'),
    name: 'SearchList',
    meta: {
      hidden: true
    },
    props: (route) => ({ locations: route.query.locations })
  }
]

export const dynamicRoutes: RouteRecordRaw[] = []

const router = createRouter({
  history,
  routes: routeSettings.thirdLevelRouteCache ? flatMultiLevelRoutes(constantRoutes) : constantRoutes
})

export function resetRouter() {
  try {
    router.getRoutes().forEach((route: any) => {
      const { name, meta } = route
      if (name && meta.roles?.length) {
        router.hasRoute(name) && router.removeRoute(name)
      }
    })
  } catch {
    window.location.reload()
  }
}

export default router
