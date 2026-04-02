import { PayStatusEnum } from '@/constants/api'

export interface TrackingSearchParam {
  trackingNumber: {
    $cont: string
  }
}

export interface TrackingListParam {
  payStatus: { $in: string[] } | PayStatusEnum | null
}

export type TrackingStatusesType = string | { $in: string[] }

export interface TrackingStatusParam {
  status: TrackingStatusesType
}
