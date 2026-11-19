import BasicService from './BasicService'
import { REGISTER_COMPANY_CODE } from '@/constants/company'
import { botTypeHeaders } from '@/utils/helpers'
import type { CaptchaResponse, SendVerificationCodeRequest } from '../../types/api'

class AuthClientService extends BasicService {
  constructor() {
    super('auth')
  }

  verifyLogin(data: any) {
    return this.post('verifyLogin', data, botTypeHeaders())
  }

  // New client: auth/register creates the client and returns a token (client/register returns none).
  // companyCode is the same as in the OTP send (login.vue).
  register(params: any) {
    return this.post<{ token: string }>('register', { ...params, companyCode: REGISTER_COMPANY_CODE }, botTypeHeaders())
  }

  getCaptcha() {
    return this.get<CaptchaResponse>('captcha')
  }

  sendVerificationCode(data: SendVerificationCodeRequest) {
    return this.post('sendVerificationCode', data, botTypeHeaders())
  }
}

export default new AuthClientService()
