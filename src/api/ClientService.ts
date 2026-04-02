import BasicService from '@/api/BasicService'
import { CashbackItemDTO, ClientInfoType } from 'types/api'

class ClientService extends BasicService {
  constructor() {
    super('client')
  }

  register(params: any) {
    return this.post('register', params)
  }

  updatePassword(params: { id?: number; password: string }) {
    return this.post('updatePassword', params)
  }

  updateDetails(details: any) {
    return this.update(details)
  }

  getCompany(companyCode: string) {
    return this.get('company', { companyCode })
  }

  updateClientLang(data: any) {
    return this.update(data)
  }

  getInfo() {
    return this.get<ClientInfoType>('info')
  }
  getChinaAddress() {
    return this.get('chinaAddress')
  }
  getCashbackBonuses(param: { promoCode: string }) {
    return this.get<CashbackItemDTO>('get-cashback-bonuses', param)
  }
}

export default new ClientService()
