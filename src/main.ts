// core
import { createApp } from 'vue'
import App from '@/App.vue'
import store from '@/store'
import router from '@/router'
import '@/router/permission'
import { loadSvg } from '@/icons'
import { loadPlugins } from '@/plugins'
import { loadDirectives } from '@/directives'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
// css
import 'normalize.css'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'vxe-table/lib/style.css'
import 'vxe-table-plugin-element/dist/style.css'
import 'vue3-toastify/dist/index.css'
import '@/styles/index.scss'
import 'uno.css'
import i18n from '@/i18n'
import Vue3Toastify from 'vue3-toastify'
import EasyLightbox from 'vue-easy-lightbox'
// import eruda from 'eruda'

// if (['staging'].includes(import.meta.env.VITE_NODE_ENV || 'staging')) {
//   eruda.init()
// }

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5
    }
  }
})

const app = createApp(App)

loadPlugins(app)
loadSvg(app)
loadDirectives(app)
app.use(store).use(router)
app.use(i18n)
app.use(Vue3Toastify)
app.use(EasyLightbox)
app.use(VueQueryPlugin, { queryClient })

router.isReady().then(() => {
  app.mount('#app')
})
