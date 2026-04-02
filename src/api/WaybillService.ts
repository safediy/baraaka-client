import BasicService from '@/api/BasicService'
import { cloneDeep } from 'lodash-es'
import { DetailsDTO } from 'types/api'
import { TrackingListParam, TrackingSearchParam, TrackingStatusParam } from 'types/params'
import { WaybillInfoDTO, WaybillInfoViewDTO } from 'types/waybill'

class WaybillService extends BasicService {
  constructor() {
    super('waybill')
  }

  query<T = unknown>(data: { s: any }): Promise<T> {
    const method = data.s.method
    if (!method) return super.query(data)
    const query = cloneDeep(data)
    delete query.s.method
    return this.get(method, query)
  }

  async view(id: number) {
    return this.get<WaybillInfoViewDTO>('view', { id })
  }

  async details(id: number) {
    return this.get<DetailsDTO>('details', { id })
  }

  getTrackingBySearchData(): (params: Partial<TrackingSearchParam & TrackingStatusParam>) => Promise<WaybillInfoDTO[]> {
    let combinedParams: Partial<TrackingSearchParam & TrackingStatusParam> = {}
    return async (params: Partial<TrackingSearchParam & TrackingStatusParam>) => {
      combinedParams = { ...combinedParams, ...params }
      return this.query<WaybillInfoDTO[]>({ s: combinedParams })
    }
  }

  getTrackingData(): (params: Partial<TrackingListParam & TrackingStatusParam>) => Promise<WaybillInfoDTO[]> {
    let combinedParams: Partial<TrackingListParam & TrackingStatusParam> = {}
    return async (params: Partial<TrackingListParam & TrackingStatusParam>) => {
      combinedParams = { ...combinedParams, ...params }
      return this.query<WaybillInfoDTO[]>({ s: combinedParams })
    }
  }

  async addTrackNumber(trackingNumber: string) {
    return this.post('', { trackingNumber })
  }

  async saveRemark(waybillId: number, remark: string) {
    return this.post(`${waybillId}/remark`, { remark })
  }
}

export default new WaybillService()
