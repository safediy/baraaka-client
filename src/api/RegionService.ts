import BasicService from '@/api/BasicService'

class RegionService extends BasicService {
  constructor() {
    super('region')
  }

  getDistricts(id: number) {
    return this.get('districts', { regionId: id })
  }
}

export default new RegionService()
