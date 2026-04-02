import { type RouteLocationNormalized } from 'vue-router'

/** 免登录白名单（匹配路由 path） */
const exactWhiteList = new Set(['/404', '/login', '/register', '/serviceMap', '/merge-waybill', '/redirect'])

// Precompiled regex for better performance
const regexWhiteList = [
  /^\/redirect\/[\w\-=]+$/, // Matches /redirect/{encodedData}
  /^\/serviceMap(?:\?.*)?$/ // Matches /serviceMap and /serviceMap?query=value
]

/** 免登录白名单（匹配路由 name） */
const whiteListByName = new Set<string>()

/** 判断是否在白名单 */
const isWhiteList = (to: RouteLocationNormalized): boolean => {
  const { path, name } = to

  // Fast lookup for exact match
  if (exactWhiteList.has(path) || whiteListByName.has(name as string)) return true

  // Check against precompiled regex patterns
  return regexWhiteList.some((regex) => regex.test(path))
}

export default isWhiteList
