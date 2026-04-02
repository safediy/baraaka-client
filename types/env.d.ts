interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_BASE_API: string
  readonly VITE_ROUTER_HISTORY: 'hash' | 'html5'
  readonly VITE_PUBLIC_PATH: string
  readonly GOOGLE_MAPS_KEY: string
  readonly VITE_NODE_ENV: 'staging' | 'development'
  readonly VITE_GOOGLE_API_KEY: string
  readonly VITE_TELEGRAM_API_SECRET: string
  readonly VITE_SMS_SECRET_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
