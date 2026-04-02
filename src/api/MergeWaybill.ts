import BasicService from '@/api/BasicService'
import { getLocalStorage } from '@/utils/cache/cookies'

class MergedWaybillService extends BasicService {
  constructor() {
    super('merged')
  }

  mergeWaybill(data: any) {
    data.message = getLocalStorage('bot-message')
    return this.post('createOne', data)
  }
}

export default new MergedWaybillService()
