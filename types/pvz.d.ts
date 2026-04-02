import { Nullable } from './common'

export interface PersonPvzDTO {
  id: number
  createdAt: string
  updatedAt: string
  nameUz: string
  nameRu: string
  nameEn: string
  name: string
  regionId: number
  districtId: number
  villageId: number
  additionalInfo: string
  fullAddress: string
  postalCode: string
  companyId: number
  latitude: number
  longitude: number
  isActive: boolean
  deletedAt: Nullable<string>
  service: number
  workTime: any[]
  phone: Nullable<string>
  photos: Nullable<string[]>
  createById: number
  isSelected: boolean
  isRated: boolean
}

export type NewPvzCredential = {
  id?: number
  latitude: number
  longitude: number
  fullAddress: string
  service: number
  message?: Nullable<string>
  trackingNumber?: any
}

export type PvzRatingCredential = {
  pvzId: number
  rateSpeed: number
  rateTreatment: number
  rateCleanliness: number
  commentSpeed?: string
  commentTreatment?: string
  commentCleanliness?: string
}
