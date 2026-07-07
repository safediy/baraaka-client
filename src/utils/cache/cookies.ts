/** 统一处理 Cookie */

import CacheKey from '@/constants/cache-key'
import Cookies from 'js-cookie'

export const getToken = () => {
  return Cookies.get(CacheKey.TOKEN)
}

export const getTokenLocal = () => {
  return localStorage.getItem(CacheKey.TOKEN)
}

// CLI-04: Harden the auth-token cookie against interception (secure) and CSRF
// (sameSite=strict). NOTE: this is a mitigation, not the real fix. A JS-set cookie
// can never be HttpOnly, and the token is also mirrored into localStorage
// (setTokenLocal / getTokenLocal), which is fully readable by any XSS.
// TRUE FIX (backend follow-up): the server should issue the JWT as a
// Secure + HttpOnly + SameSite cookie via Set-Cookie, and the client should stop
// storing the JWT in localStorage entirely.
export const setToken = (token: string) => {
  Cookies.set(CacheKey.TOKEN, token, { secure: true, sameSite: 'strict' })
}

export const setTokenLocal = (token: string) => {
  localStorage.setItem(CacheKey.TOKEN, token)
}

export const setLocalStorage = (key: string, value: string) => {
  localStorage.setItem(key, value)
}

export const setSessianStorage = (key: string, value: string) => {
  sessionStorage.setItem(key, value)
}

export const getSessianStorage = (key: string) => {
  return sessionStorage.getItem(key)
}
export const removeSessianStorage = (key: string) => {
  sessionStorage.removeItem(key)
}
export const getLocalStorage = (key: string) => {
  return localStorage.getItem(key)
}

export const removeLocalStorage = (key: string) => {
  localStorage.removeItem(key)
}

export const removeToken = () => {
  Cookies.remove(CacheKey.TOKEN)
  localStorage.removeItem(CacheKey.TOKEN)
}
