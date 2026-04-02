import BasicService from '@/api/BasicService'

class SmsService extends BasicService {
  constructor() {
    super('sms')
  }

  async sendVerificationCode(params: object) {
    return this.post('sendVerificationCode', params)
  }
}

export default new SmsService()
