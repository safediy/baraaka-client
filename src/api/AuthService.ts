import BasicService from './BasicService'
import type { SendVerificationCodeRequest } from '../../types/api'

class AuthClientService extends BasicService {
  constructor() {
    super('auth')
  }

  verifyLogin(data: any) {
    return this.post('verifyLogin', data)
  }

  sendVerificationCode(data: SendVerificationCodeRequest) {
    return this.post('sendVerificationCode', data)
  }
}

export default new AuthClientService()
