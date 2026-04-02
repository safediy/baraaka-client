import { ClientStatsType } from 'types/api'
import BasicService from './BasicService'

class DataService extends BasicService {
  constructor() {
    super('data')
  }
  clientStats() {
    return this.get<ClientStatsType>('client-stats')
  }
}

export default new DataService()
