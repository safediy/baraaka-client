import { PaymentTypes } from 'types/api'
import BasicService from './BasicService'

interface PaymentDataType {
  clientId: number | undefined
  trackingNumbers: string[]
  amount: number
}

class PaymentService extends BasicService {
  constructor() {
    super('pay')
  }
  async Payment(data: PaymentDataType) {
    return this.post<PaymentTypes>('create', data)
  }
}

export default new PaymentService()
