import BasicService from '@/api/BasicService'
import { getLocalStorage } from '@/utils/cache/cookies'
import { LocationInfoDTO } from 'types/api'
import { Nullable } from 'types/common'
import { PersonPvzDTO } from 'types/pvz'

type newPvzType = {
  latitude: number
  longitude: number
  fullAddress: string
  service: number
  message?: Nullable<string>
  trackingNumber?: any
}

class PersonPvzService extends BasicService {
  constructor() {
    super('person-pvz')
  }

  addPersonPvz(data: newPvzType) {
    data.message = getLocalStorage('bot-message')

    return this.post('', data)
  }
  getPersonPvz() {
    return this.get<LocationInfoDTO[]>('')
  }

  updatePersonPvz(pvz: any) {
    return this.updatePvz(pvz)
  }

  selectPersonPvz(pvz: PersonPvzDTO) {
    return this.post('', pvz)
  }

  deletePersonPvz(pvz: LocationInfoDTO) {
    return this.delete(pvz.id)
  }

  getAddressList() {
    return this.get('addressList')
  }
}

export default new PersonPvzService()
