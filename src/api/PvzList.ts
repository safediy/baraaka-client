import BasicService from '@/api/BasicService'
import { AddressTypesDTO } from 'types/pickupPoints'

class PvzService extends BasicService {
  constructor() {
    super('pvz')
  }

  async addressList() {
    return await this.get<AddressTypesDTO[]>('pick-up-points')
  }

  async emuPickUpPoints() {
    return await this.get<AddressTypesDTO[]>('emu-pick-up-points')
  }
}

export default new PvzService()
