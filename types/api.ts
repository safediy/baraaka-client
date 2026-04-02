import { DeliveryServiceEnum, DeliveryStatusEnum, PayStatusEnum } from '@/constants/api'
import { Nullable } from './common'

export type LogisticType = {
  status: string
  operateAt: Date
  description: string
}

export type PickupPointType = {
  fullAddress: string
  service: number
}

export type ClientType = {
  name: string
  phoneNumber: string
}

export interface MapPredictionDTO {
  description: string
  matched_substrings: Array<{
    length: number
    offset: number
  }>
  place_id: string
  reference: string
  structured_formatting: {
    main_text: string
    main_text_matched_substrings: Array<{
      length: number
      offset: number
    }>
    secondary_text: string
    secondary_text_matched_substrings: Array<{
      length: number
      offset: number
    }>
  }
  terms: Array<{
    offset: number
    value: string
  }>
  types: string[]
}

export interface DetailsDTO {
  id: number
  createdAt: string
  trackingNumber: string
  clientId: number
  boxId: number
  pvzId: number
  images: string[]
  pickUpPoint: PickupPointType
  logistics: LogisticType[]
}

// PVZ Address Types on Map

export interface LocationInfoDTO {
  id: number
  name: Nullable<string>
  regionId: Nullable<number>
  districtId: Nullable<number>
  villageId: Nullable<number>
  additionalInfo: Nullable<string>
  postalCode: Nullable<string>
  fullAddress: string
  companyId: number
  service: Nullable<number>
  latitude: number
  longitude: number
  workTime: Nullable<string>
  isActive: boolean
  clientId: number
  change_time: string
}

// Payment Types

type paymentType = {
  country: string
  isActive: boolean
  name: string
  url: string
}

export interface PaymentTypes {
  orderId: string
  payments: paymentType
  statusCode: number
}

export interface ITelegramUser {
  allows_write_to_pm: boolean
  first_name: string
  id: number
  is_premium: boolean
  language_code: string
  last_name: string
  photo_url: string
  username: string
}

// Client

export interface PvzType {
  id: number
  name: Nullable<string>
  regionId: Nullable<number>
  districtId: Nullable<number>
  villageId: Nullable<number>
  additionalInfo: Nullable<string>
  postalCode: Nullable<string>
  fullAddress: string
  companyId: number
  service: Nullable<string>
  latitude: Nullable<number>
  longitude: Nullable<number>
  workTime: Nullable<string>
  isActive: boolean
  clientId: number
}

export interface MapLocationDTO {
  additionalInfo: string
  address: string
  companyId: number
  createById: Nullable<number>
  createdAt: string
  deletedAt: Nullable<string>
  district: Record<string, unknown>
  districtId: number
  fullAddress: string
  id: number
  isActive: boolean
  isSelected: boolean
  latitude: number
  longitude: number
  name: string
  nameUz: string
  nameRu: string
  nameEn: string
  phone: string
  photos: Nullable<string[]>
  postalCode: string
  region: Record<string, unknown>
  regionId: number
  service: DeliveryServiceEnum
  updatedAt: string
  village: Record<string, unknown>
  villageId: number
  workTime: Array<{
    day: string
    time: string
  }>
}

export interface ClientInfoType {
  id: number
  createdAt: string
  updatedAt: string
  code: number
  name: string
  password: string
  phoneNumber: string
  email: Nullable<string>
  lastOrderAt: string
  isActive: boolean
  passportNo: Nullable<string>
  passportEffectiveDate: Nullable<string>
  passportExpireDate: Nullable<string>
  passportUrls: Nullable<string>
  companyId: number
  pvzId: number
  priceType: string
  priceCycle: number
  currentPrice: number
  deliveryPrice: number
  nextUpdatePriceDate: string
  chatId: number
  language: string
  source: string
  deletedAt: Nullable<string>
  pvz: Nullable<PvzType>
}

type monthsWeightType = {
  month: number
  totalWeight: number
}
export interface ClientStatsType {
  totalWaybillsCount: number
  totalWeight: number
  totalPayAmount: number
  monthsWeight: monthsWeightType[]
}

export interface CashbackItemDTO {
  totalCount: number
  totalWeight: number
  totalAmount: number
  totalReferredCount: number
}

// Auth Service Types
export interface SendVerificationCodeRequest {
  phone: string
  type: 'REGISTER' | 'LOGIN' | 'RESET_PASSWORD'
  companyCode: string
  cProvider?: string
  _csrf?: string
}
