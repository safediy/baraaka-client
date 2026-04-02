import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { removeConfigLayout } from '@/utils/cache/local-storage'
// import { Nullable, StringNumber } from 'types/common'

/** 格式化时间 */
export const formatColumnDateTime = (row: any, column: any, cellValue: any) => {
  return formatDateTime(cellValue)
}
export const formatDateTime = (time: Date | string) => {
  dayjs.extend(utc)
  dayjs.extend(timezone)
  return time ? dayjs(new Date(time)).tz('Asia/Tashkent').format('DD-MM-YYYY HH:mm') : 'N/A'
}

export const getDayjs = () => {
  dayjs.extend(utc)
  dayjs.extend(timezone)
  return dayjs().tz('Asia/Tashkent')
}

export const getToday = () => {
  return getDayjs().format('YYYY-MM-DD')
}

export const getLastDay = (quantity = 1) => {
  return getDayjs().subtract(quantity, 'day').format('YYYY-MM-DD')
}

export const formattedNumber = (number: number) => {
  return number?.toFixed().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/** 用 JS 获取全局 css 变量 */
export const getCssVariableValue = (cssVariableName: string) => {
  let cssVariableValue = ''
  try {
    // 没有拿到值时，会返回空串
    cssVariableValue = getComputedStyle(document.documentElement).getPropertyValue(cssVariableName)
  } catch (error) {
    console.error(error)
  }
  return cssVariableValue
}

/** 用 JS 设置全局 CSS 变量 */
export const setCssVariableValue = (cssVariableName: string, cssVariableValue: string) => {
  try {
    document.documentElement.style.setProperty(cssVariableName, cssVariableValue)
  } catch (error) {
    console.error(error)
  }
}

export function validateTrackingNumbers(trackingNumbers: string) {
  if (!trackingNumbers.trim()) return false

  const regex = /^(?=(.*\d){4})[A-Za-z\d]{8,}$/

  const numbers = trackingNumbers
    .split(/[\s,|-]+/)
    .map((n) => n.trim())
    .filter(Boolean)

  return numbers.length > 0 && numbers.every((n) => regex.test(n))
}

/** 重置项目配置 */
export const resetConfigLayout = () => {
  removeConfigLayout()
  location.reload()
}

export const formatPhone = (value: string): string => {
  const input = value?.replace(/\D/g, '')

  if (input.length === 9) {
    return input.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4')
  }

  if (input.length === 12) {
    return input.replace(/(\d{5})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4')
  }

  return input
}

export const formatPhoneInput = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 9) // maksimal 9 raqam
  if (digits.length === 0) return ''
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`
  if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2, 5)}-${digits.slice(5)}`
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)}-${digits.slice(5, 7)}-${digits.slice(7)}`
}

export const getPasswordValidator = (t: any) => {
  return [
    { required: true, message: t('passwordRequired'), trigger: 'blur' },
    { min: 8, max: 20, message: t('passwordLength'), trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        const strongPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
        if (!strongPassword.test(value)) {
          callback(new Error(t('passwordStrength')))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}
export const decodeHexBrowser = (encodedData: any): Record<string, any> => {
  const hexString = encodedData
    .match(/.{1,2}/g)
    .map((byte: string) => String.fromCharCode(parseInt(byte, 16)))
    .join('')
  return JSON.parse(hexString)
}

export function getConfirmPasswordValidator(t: any, formData: any) {
  return [
    { required: true, message: t('confirmPasswordRequired'), trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        console.log(value)
        console.log(formData.newPassword)
        if (value !== formData.newPassword) {
          callback(new Error(t('passwordMismatch')))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

export const formattedPhoneNumber = (number: number | string) => {
  const digits = String(number).replace(/\D/g, '').slice(-9)
  if (digits.length !== 9) return String(number)
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`
}
