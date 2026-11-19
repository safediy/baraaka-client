import {
  stringifyQuery,
  type LocationQueryValue,
  type RouteLocationNormalized,
  type RouteLocationRaw,
  type Router
} from 'vue-router'

// The page to return to after login: `/login?redirect=/orders?id=7`. The query key lives only in this file.
const RETURN_KEY = 'redirect'

/** No token: the login page, with the page being opened kept in the `redirect` query (the bot's `tokenKey` is left out) */
export function loginLocation(to: Pick<RouteLocationNormalized, 'path' | 'query' | 'hash'>): RouteLocationRaw {
  const { tokenKey: _tokenKey, ...query } = to.query
  const search = stringifyQuery(query)
  return { path: '/login', query: { [RETURN_KEY]: `${to.path}${search ? `?${search}` : ''}${to.hash ?? ''}` } }
}

// Browsers strip tab and newline from URLs (`/\t/evil` becomes `//evil`), so control characters are rejected
const hasControlChar = (value: string) =>
  Array.from(value).some((ch) => ch.charCodeAt(0) < 0x20 || ch.charCodeAt(0) === 0x7f)

/**
 * Only an in-app path: it starts with `/`, not with `//` or `/\` (another site), has no control characters, and is not
 * the login page itself (routes match case-insensitively). Any other value gives `fallback`.
 */
export function returnPath(value: LocationQueryValue | LocationQueryValue[] | undefined, fallback = '/'): string {
  const path = Array.isArray(value) ? value[0] : value
  if (typeof path !== 'string' || hasControlChar(path)) return fallback
  if (!/^\/(?![/\\])/.test(path) || /^\/login(?:[/?#]|$)/i.test(path)) return fallback
  return path
}

/** After login or registration: go to the `redirect` page, or to `fallback` when there is none */
export function goAfterLogin(router: Router, fallback = '/') {
  return router.push(returnPath(router.currentRoute.value.query[RETURN_KEY], fallback))
}
