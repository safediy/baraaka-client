import { request } from '@/utils/service'

/** 获取登录验证码 */
export function getLoginCodeApi() {
  return request<any>({
    url: 'login/code',
    method: 'get'
  })
}

/** 登录并返回 Token */
export function loginApi(data: any) {
  return request({
    url: 'auth/login',
    method: 'post',
    data
  })
}

/** 获取用户详情 */
export function getUserInfoApi() {
  return request<any>({
    url: 'client/info',
    method: 'get'
  })
}

export function logoutApi() {
  return request({
    url: 'client/telegramLogout',
    method: 'post'
  })
}
