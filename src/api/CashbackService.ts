import BasicService from '@/api/BasicService'

class CashbackService extends BasicService {
  constructor() {
    super('cashback')
  }

  viewCashback(promoCode: string) {
    return this.get(`view?promoCode=${promoCode}`)
  }
  payCashback(cashbackId: number, data: { amount: number; method: string }) {
    return this.post(`pay/${cashbackId}`, data)
  }

  createPromoCode(data: any) {
    return this.post('create', data)
  }
}

export default new CashbackService()
