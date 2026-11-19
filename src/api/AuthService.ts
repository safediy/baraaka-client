import BasicService from './BasicService'
import { botTypeHeaders } from '@/utils/helpers'
import type { SendVerificationCodeRequest } from '../../types/api'

class AuthClientService extends BasicService {
  constructor() {
    super('auth')
  }

  verifyLogin(data: any) {
    return this.post('verifyLogin', data, botTypeHeaders())
  }

  sendVerificationCode(data: SendVerificationCodeRequest) {
    return this.post('sendVerificationCode', data, botTypeHeaders())
  }
}

export default new AuthClientService()
