import { Nullable } from 'types/common'

export enum LocationStatusEnum {
  DELIVERY = 'DELIVERY',
  PVZ = 'PVZ'
}

export enum PayStatusEnum {
  UN_BILLED = 'UN_BILLED',
  UN_PAID = 'UN_PAID',
  PAID = 'PAID'
}

export enum DeliveryStatusEnum {
  CREATED = 'CREATED',
  Warehouse = 'Warehouse',
  UN_LAWFUL = 'UN_LAWFUL',
  No_client = 'No_client',
  Yiwu = 'Yiwu',
  Ulugchat = 'Ulugchat',
  Osh = 'Osh',
  Toshkent = 'Toshkent',
  ReProcessing = 'ReProcessing',
  Approaching = 'Approaching',
  Dropzone = 'Dropzone',
  Recieved = 'Recieved',
  Delivered = 'Delivered',
  DAMAGED = 'DAMAGED',
  RETURNED = 'RETURNED',
  ISSUE = 'ISSUE'
}

export enum DeliveryServiceEnum {
  UZ_POST = 1,
  RELOG = 2,
  IPOST = 3,
  EMU = 4,
  STAREX = 5,
  BTS = 6
}

export type TrackingStatusKey = 'ALL' | 'CREATED' | 'ON_WAY' | 'IN_TASHKENT' | 'DropZone' | 'Delivered' | 'UN_LAWFUL'

export interface TrackingStatusItem {
  key: TrackingStatusKey
  value: { status: string | { $in: string[] } }
  label: string
}

export const TrackingStatusArray = (
  isHide?: Nullable<Partial<Record<TrackingStatusKey, boolean>>>
): TrackingStatusItem[] => {
  const statusArray: TrackingStatusItem[] = [
    { key: 'ALL', value: { status: '' }, label: 'Barchasi' },
    { key: 'CREATED', value: { status: 'CREATED' }, label: 'Yaratilgan' },
    { key: 'ON_WAY', value: { status: { $in: ['Warehouse', 'Yiwu', 'Ulugchat', 'Osh'] } }, label: 'Yo`lda' },
    { key: 'IN_TASHKENT', value: { status: { $in: ['Toshkent', 'ReProcessing'] } }, label: 'Toshkentda' },
    { key: 'DropZone', value: { status: 'DropZone' }, label: '' },
    { key: 'Delivered', value: { status: 'Delivered' }, label: 'Qabul qilingan' },
    { key: 'UN_LAWFUL', value: { status: 'UN_LAWFUL' }, label: 'Boshqalar' }
  ]

  if (isHide && typeof isHide === 'object') {
    return statusArray.filter((item) => !isHide[item.key])
  }

  return statusArray
}

export const tashkentDefaultLocation = {
  lat: 41.311291,
  lng: 69.279756
}
