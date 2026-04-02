/** 统一处理 Cookie */

import CacheKey from '@/constants/cache-key'
import Cookies from 'js-cookie'

export const getToken = () => {
  return Cookies.get(CacheKey.TOKEN)
}

export const getTokenLocal = () => {
  return localStorage.getItem(CacheKey.TOKEN)
}

export const setToken = (token: string) => {
  Cookies.set(CacheKey.TOKEN, token)
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
