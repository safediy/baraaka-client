import { PayStatusEnum } from '@/constants/api'
import CryptoJS from 'crypto-js'
import { WaybillInfoDTO } from 'types/waybill'

export function sortUnpaidFirst(items: WaybillInfoDTO[]) {
  return items.sort((a, b) => (a.payStatus === PayStatusEnum.UN_PAID && b.payStatus !== PayStatusEnum.UN_PAID ? -1 : 0))
}

export function parseInitDataTelegram(initData: string) {
  const params = new URLSearchParams(initData)

  const userData = JSON.parse(decodeURIComponent(params.get('user') as string))
  return userData
}

export function sumtoTin(sum: number): number {
  return sum * 100
}

export function generateHmacHash(access: string, secretKey: string): string {
  return CryptoJS.HmacSHA256(access, secretKey).toString(CryptoJS.enc.Hex)
}

export function generateHmacHashKey(verifyCode: number) {
  const appKey = import.meta.env.VITE_SMS_SECRET_KEY as string

  const unixtime = Math.floor(Date.now() / 1000)

  const rawString = unixtime + ':' + verifyCode
  const expectedHash = generateHmacHash(rawString, appKey)

  const enCode = btoa(JSON.stringify({ _csrf: expectedHash, verifyCode, unixtime }))

  return enCode
}
