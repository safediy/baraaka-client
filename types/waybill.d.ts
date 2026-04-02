import { DeliveryStatusEnum, PayStatusEnum } from '@/constants/api'
import { ClientType, LocationInfoDTO, LogisticType, PickupPointType } from './api'
import { Nullable } from './common'

export interface WaybillInfoDTO {
  id: number
  createdAt: string
  updatedAt: string
  trackingNumber: string
  companyId: number
  companyCode: string
  clientId: number
  clientCode: string
  source: string
  weight: Nullable<number>
  length: Nullable<number>
  width: Nullable<number>
  height: Nullable<number>
  volume: Nullable<number>
  status: DeliveryStatusEnum
  payStatus: PayStatusEnum
  remark: Nullable<string>
  packingType: string
  paymentNumber: Nullable<string>
  details: Nullable<string>
  isValuable: boolean
  valuableNote: Nullable<string>
  freight: Nullable<number>
  originFreight: Nullable<number>
  isSettled: boolean
  surcharge: Nullable<number>
  payAmount: Nullable<number>
  payAt: Nullable<string>
  paymentMethod: Nullable<string>
  billId: Nullable<number>
  boxId: Nullable<number>
  mergedId: Nullable<number>
  pvzId: number
  serviceStatus: Nullable<string>
  image: string
  payAmountSom: number
  pickupPoint_history: LocationInfoDTO[]
  batchCode?: string
  canPayment: boolean
}

export interface WaybillInfoViewDTO extends WaybillInfoDTO {
  client?: ClientType
  payType: Nullable<string>
  images?: string[]
  pickUpPoint?: PickupPointType
  logistics?: LogisticType[]
}
