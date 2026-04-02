import BasicService from '@/api/BasicService'

class AddressService extends BasicService {
  constructor() {
    super('address')
  }

  setDefault(id: number) {
    return this.post('setDefault', { id })
  }
}

export default new AddressService()
