declare module '*.scss' {
  const scss: Record<string, string>
  export default scss
}

import type { Telegram } from '@types/telegram-web-app'

declare global {
  interface Window {
    Telegram: Telegram
  }
}
