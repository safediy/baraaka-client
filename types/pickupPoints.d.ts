type AbusahiyPvzType = {
  id: number
  name: string
  address: string
  fullAddress: string
  additionalInfo: string
  companyId: number
  districtId: number
  regionId: number
  villageId: number
  district: Record<string, unknown>
  region: Record<string, unknown>
  village: Record<string, unknown>
  isActive: boolean
  latitude: number
  longitude: number
  postalCode: string
  service: number
  createdAt: string
  updatedAt: string
  phone: string
  workTime: string[]
  deletedAt: Nullable<string>
}
type GeneralPvzType = {
  address: string
  branchType: number
  cityName: string
  directions: string
  fullAddress: string
  id: number
  latitude: number
  longitude: number
  lunchBreak: string
  maximumWeight: number
  name: string
  phoneNumber: string
  pickupPointCode: number
  pickupPointName: string
  postalCode: number
  regionCode: number
  regionName: string
  scheduleFri: string
  scheduleMon: string
  scheduleSat: string
  scheduleSun: string
  scheduleThu: string
  scheduleTue: string
  scheduleWed: string
  service: number
  phone: string
}

export type AddressTypesDTO = AbusahiyPvzType | GeneralPvzType
