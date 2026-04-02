import { request } from '@/utils/service'
import { ChinaAddressResponse } from 'types/client'

export const clientService = {
  getChinaAddress: () => {
    return request<ChinaAddressResponse>({
      url: '/client/chinaAddress',
      method: 'get'
    })
  }
}
