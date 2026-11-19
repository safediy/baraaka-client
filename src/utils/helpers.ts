import { PayStatusEnum } from '@/constants/api'
import CryptoJS from 'crypto-js'
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

export function generateHmacHash(access: string, secretKey: string): string {
  return CryptoJS.HmacSHA256(access, secretKey).toString(CryptoJS.enc.Hex)
}

export function generateHmacHashKey(verifyCode: number) {
  // CLI-02 SECURITY (architectural): VITE_* vars are inlined into the browser
  // bundle at build time, so VITE_SMS_SECRET_KEY is shipped to every client and is
  // NOT actually secret. An attacker can extract it and forge the SMS _csrf hash.
  // TRUE FIX (backend follow-up): perform this HMAC signing on a backend endpoint
  // so the secret never reaches the browser. MANUAL ACTION REQUIRED: rotate
  // VITE_SMS_SECRET_KEY once signing is server-side (current value already exposed
  // in prior bundles). Tracked in docs/security.
  const appKey = import.meta.env.VITE_SMS_SECRET_KEY as string

  const unixtime = Math.floor(Date.now() / 1000)

  const rawString = unixtime + ':' + verifyCode
  const expectedHash = generateHmacHash(rawString, appKey)

  const enCode = btoa(JSON.stringify({ _csrf: expectedHash, verifyCode, unixtime }))

  return enCode
}
