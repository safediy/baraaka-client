export interface TrackingStatusesEntity {
  ALL: string
  CREATED: string
  ON_WAY: { $in: string[] }
  IN_TASHKENT: { $in: string[] }
  DELIVERED: string
}
