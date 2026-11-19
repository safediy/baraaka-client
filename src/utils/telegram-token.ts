import { setToken, setTokenLocal } from '@/utils/cache/cookies'
import { isTelegramMode } from '@/utils/helpers'

/** Removes `tokenKey` from both the query string and a hash-router query. */
function stripTokenKey(href: string): string {
  const url = new URL(href)
  url.searchParams.delete('tokenKey')
  const qIndex = url.hash.indexOf('?')
  if (qIndex !== -1) {
    const hashQuery = new URLSearchParams(url.hash.slice(qIndex + 1))
    hashQuery.delete('tokenKey')
    const rest = hashQuery.toString()
    url.hash = url.hash.slice(0, qIndex) + (rest ? `?${rest}` : '')
  }
  return url.pathname + url.search + url.hash
}

/**
 * Bot-issued token handoff: in Telegram mode a `tokenKey` in the URL is stored as
 * the session token and removed from the address bar. Returns the token or null.
 */
export function consumeTokenKey(tokenKey: unknown): string | null {
  if (!isTelegramMode()) return null
  const value = Array.isArray(tokenKey) ? tokenKey[0] : tokenKey
  if (typeof value !== 'string' || !value) return null
  setToken(value)
  setTokenLocal(value)
  window.history.replaceState(window.history.state, '', stripTokenKey(window.location.href))
  return value
}
