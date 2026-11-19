import { PayStatusEnum } from '@/constants/api'
import { WaybillInfoDTO } from 'types/waybill'

export function sortUnpaidFirst(items: WaybillInfoDTO[]) {
  return items.sort((a, b) => (a.payStatus === PayStatusEnum.UN_PAID && b.payStatus !== PayStatusEnum.UN_PAID ? -1 : 0))
}

export function parseInitDataTelegram(initData: string) {
  try {
    const user = new URLSearchParams(initData).get('user')
    if (!user) return null
    const userData = JSON.parse(user)
    return userData && typeof userData === 'object' ? userData : null
  } catch {
    return null
  }
}

/** bot_type is a public routing hint (P2C/B2C), not a secret. Sent only when configured. */
export function botTypeHeaders(): Record<string, string> | undefined {
  const botType = import.meta.env.VITE_BOT_TYPE as string | undefined
  return botType ? { bot_type: botType } : undefined
}

export function isTelegramMode(): boolean {
  return Boolean(window.Telegram?.WebApp?.initData)
}

export function sumtoTin(sum: number): number {
  return sum * 100
}

/** Encodes an SVG string as base64 for a data: URL; UTF-8 safe (btoa alone throws on non-Latin1). */
export function svgToBase64(svg: string): string {
  const bytes = new TextEncoder().encode(svg)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

/** True when the API reports a wrong/expired server captcha: body is {statusCode, error: 'CAPTCHA_FAILED', message: {ru,uz,en}}. */
export function isCaptchaFailed(error: unknown): boolean {
  const code = (error as { response?: { data?: { error?: unknown } } } | null)?.response?.data?.error
  return code === 'CAPTCHA_FAILED'
}
