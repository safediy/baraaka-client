import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const INIT_DATA = 'query_id=AAA&user=' + encodeURIComponent(JSON.stringify({ id: 123456, first_name: 'T' }))

const requestMock = vi.fn()
const tokenState = { cookie: undefined as string | undefined, local: null as string | null }
const setTokenMock = vi.fn((t: string) => {
  tokenState.cookie = t
})
const setTokenLocalMock = vi.fn((t: string) => {
  tokenState.local = t
})

function setTelegram(initData: string) {
  ;(window as any).Telegram = { WebApp: { initData } }
}

describe('parseInitDataTelegram', () => {
  it('returns null for empty or malformed initData', async () => {
    const { parseInitDataTelegram } = await import('@/utils/helpers')
    expect(parseInitDataTelegram('')).toBeNull()
    expect(parseInitDataTelegram('user=%7Bnot-json')).toBeNull()
    expect(parseInitDataTelegram('a=b')).toBeNull()
    expect(parseInitDataTelegram(INIT_DATA)).toMatchObject({ id: 123456 })
  })
})

describe('request headers in Telegram mode', () => {
  beforeEach(() => {
    vi.resetModules()
    setTelegram(INIT_DATA)
  })

  async function captureHeaders(token?: string) {
    vi.doMock('@/utils/cache/cookies', () => ({
      getToken: () => token,
      getTokenLocal: () => null
    }))
    let captured: any
    const adapter = async (config: any) => {
      captured = config
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
    }
    const { request } = await import('@/utils/service')
    await request({ url: 'x', method: 'get', adapter } as any)
    return captured.headers.toJSON ? captured.headers.toJSON() : captured.headers
  }

  it('sends CLIENT_WEB without any signing headers or secret', async () => {
    const headers = await captureHeaders()
    expect(headers.source).toBe('CLIENT_WEB')
    for (const h of ['x-apikey', 'x-chat-id', 'x-timestamp']) expect(headers[h]).toBeUndefined()
    expect(headers.Authorization).toBeUndefined()
  })

  it('sends Bearer token when present', async () => {
    const headers = await captureHeaders('T0K')
    expect(headers.Authorization).toBe('Bearer T0K')
    expect(headers.source).toBe('CLIENT_WEB')
  })
})

describe('bot_type on auth calls', () => {
  beforeEach(() => {
    vi.resetModules()
    requestMock.mockReset()
    requestMock.mockResolvedValue({})
    vi.doMock('@/utils/service', () => ({ request: requestMock }))
  })
  afterEach(() => vi.unstubAllEnvs())

  it('verifyLogin carries bot_type when VITE_BOT_TYPE is set, and no chatId', async () => {
    vi.stubEnv('VITE_BOT_TYPE', 'B2C')
    const AuthService = (await import('@/api/AuthService')).default
    await AuthService.verifyLogin({ phone: '1', verificationCode: '1111' })
    const cfg = requestMock.mock.calls[0][0]
    expect(cfg.headers).toEqual({ bot_type: 'B2C' })
    expect(cfg.data).not.toHaveProperty('chatId')
  })

  it('omits bot_type when VITE_BOT_TYPE is unset', async () => {
    vi.stubEnv('VITE_BOT_TYPE', '')
    const AuthService = (await import('@/api/AuthService')).default
    await AuthService.verifyLogin({ phone: '1', verificationCode: '1111' })
    await AuthService.sendVerificationCode({ phone: '1' } as any)
    for (const call of requestMock.mock.calls) expect(call[0].headers).toBeUndefined()
  })

  it('sendVerificationCode and register carry bot_type', async () => {
    vi.stubEnv('VITE_BOT_TYPE', 'B2C')
    const AuthService = (await import('@/api/AuthService')).default
    const ClientService = (await import('@/api/ClientService')).default
    await AuthService.sendVerificationCode({ phone: '1' } as any)
    await ClientService.register({ name: 'a' })
    expect(requestMock.mock.calls).toHaveLength(2)
    for (const call of requestMock.mock.calls) expect(call[0].headers).toEqual({ bot_type: 'B2C' })
  })

  it('register sends the same companyCode as the OTP send (login.vue)', async () => {
    const { REGISTER_COMPANY_CODE } = await import('@/constants/company')
    const ClientService = (await import('@/api/ClientService')).default
    await ClientService.register({ name: 'a', phoneNumber: '1', verificationCode: '1111' })
    expect(requestMock.mock.calls[0][0].data).toMatchObject({ name: 'a', companyCode: REGISTER_COMPANY_CODE })
    const loginVue = readFileSync(join(__dirname, '..', 'src/views/auth/login.vue'), 'utf8')
    expect(loginVue).toContain('companyCode: REGISTER_COMPANY_CODE')
    expect(REGISTER_COMPANY_CODE).toBe('077')
  })
})

describe('tokenKey handoff and router guard', () => {
  beforeEach(() => {
    vi.resetModules()
    setTokenMock.mockClear()
    setTokenLocalMock.mockClear()
    vi.doMock('@/utils/cache/cookies', () => ({
      getToken: () => tokenState.cookie,
      getTokenLocal: () => tokenState.local,
      setToken: setTokenMock,
      setTokenLocal: setTokenLocalMock
    }))
    tokenState.cookie = undefined
    tokenState.local = null
  })

  it('stores tokenKey and strips it from the URL via replaceState (query and hash query)', async () => {
    setTelegram(INIT_DATA)
    window.history.pushState({}, '', '/merge-waybill?waybill=abc&tokenKey=T')
    const spy = vi.spyOn(window.history, 'replaceState')
    const { consumeTokenKey } = await import('@/utils/telegram-token')
    expect(consumeTokenKey('T')).toBe('T')
    expect(setTokenMock).toHaveBeenCalledWith('T')
    expect(spy).toHaveBeenCalled()
    expect(window.location.search).toBe('?waybill=abc')

    window.history.pushState({}, '', '/#/merge-waybill?tokenKey=T&waybill=abc')
    consumeTokenKey('T')
    expect(window.location.hash).toBe('#/merge-waybill?waybill=abc')
    spy.mockRestore()
  })

  it('ignores tokenKey outside Telegram mode', async () => {
    setTelegram('')
    const { consumeTokenKey } = await import('@/utils/telegram-token')
    expect(consumeTokenKey('T')).toBeNull()
    expect(setTokenMock).not.toHaveBeenCalled()
  })

  it('guard: no token redirects to /login with the page in redirect; tokenKey does not', async () => {
    setTelegram(INIT_DATA)
    let guard: any
    vi.doMock('@/router', () => ({
      default: { beforeEach: (fn: any) => (guard = fn), afterEach: vi.fn(), addRoute: vi.fn() }
    }))
    const userStoreState: any = { role: 'CLIENT', token: '', getInfo: vi.fn(), resetToken: vi.fn() }
    userStoreState.setSessionToken = (t: string) => {
      userStoreState.token = t
    }
    vi.doMock('@/store/modules/user', () => ({ useUserStoreHook: () => userStoreState }))
    vi.doMock('@/store/modules/permission', () => ({ usePermissionStoreHook: () => ({}) }))
    vi.doMock('@/hooks/useRouteListener', () => ({ setRouteChange: vi.fn() }))
    vi.doMock('@/hooks/useTitle', () => ({ useTitle: () => ({ setTitle: vi.fn() }) }))
    vi.doMock('nprogress', () => ({ default: { configure: vi.fn(), start: vi.fn(), done: vi.fn() } }))
    vi.doMock('nprogress/nprogress.css', () => ({}))
    await import('@/router/permission')

    const next = vi.fn()
    await guard({ path: '/profil', fullPath: '/profil', query: {} }, {}, next)
    expect(next).toHaveBeenCalledWith({ path: '/login', query: { redirect: '/profil' } })

    next.mockClear()
    window.history.pushState({}, '', '/profil?tokenKey=T')
    await guard({ path: '/profil', query: { tokenKey: 'T' } }, {}, next)
    expect(setTokenMock).toHaveBeenCalledWith('T')
    expect(next).toHaveBeenCalledWith()
    expect(userStoreState.token).toBe('T')

    next.mockClear()
    await guard({ path: '/profil', query: {} }, {}, next)
    expect(next).not.toHaveBeenCalledWith({ path: '/login' })
    expect(next).toHaveBeenCalled()
  })
})

describe('no shipped secret', () => {
  it('VITE_TELEGRAM_API_SECRET is absent from the repo sources', () => {
    const hits: string[] = []
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        if (['node_modules', '.git', 'dist', 'tests'].includes(name)) continue
        const p = join(dir, name)
        if (statSync(p).isDirectory()) walk(p)
        else if (/\.(ts|vue|js|toml|yml|json|md)$/.test(name) || name === '.env.example') {
          if (readFileSync(p, 'utf8').includes('VITE_TELEGRAM_API_SECRET')) hits.push(p)
        }
      }
    }
    walk(process.cwd())
    expect(hits).toEqual([])
  })
})
