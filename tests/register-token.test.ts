import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Answers like the API: client/register returns the created client (no token), auth/register returns a token
const requestMock = vi.fn(async (config: any) => {
  if (config.url === 'auth/register') return { token: 'NEW.JWT', status: 200 }
  if (config.url === 'client/register') return { id: 5, name: 'Ali', code: '00002' }
  return {}
})
const setTokenMock = vi.fn()

async function freshUserStore() {
  const { createPinia, setActivePinia } = await import('pinia')
  setActivePinia(createPinia())
  const { useUserStore } = await import('@/store/modules/user')
  return useUserStore()
}

describe('token after registration', () => {
  beforeEach(() => {
    vi.resetModules()
    requestMock.mockClear()
    setTokenMock.mockClear()
    vi.doMock('@/utils/service', () => ({ request: requestMock }))
    // The real setToken writes a secure cookie, which jsdom does not keep on http: record the value instead
    vi.doMock('@/utils/cache/cookies', async (importOriginal) => ({
      ...(await importOriginal<object>()),
      setToken: setTokenMock
    }))
  })
  afterEach(() => vi.unstubAllEnvs())

  it('stores the token returned by the API, not undefined', async () => {
    const store = await freshUserStore()
    await store.register({ name: 'Ali', phoneNumber: '900000102', verificationCode: '1234' })
    expect(setTokenMock).toHaveBeenCalledWith('NEW.JWT')
    expect(store.token).toBe('NEW.JWT')
  })

  it('posts to auth/register with the OTP companyCode and bot_type', async () => {
    vi.stubEnv('VITE_BOT_TYPE', 'B2C')
    const store = await freshUserStore()
    const { REGISTER_COMPANY_CODE } = await import('@/constants/company')
    await store.register({ name: 'Ali', phoneNumber: '900000102', verificationCode: '1234' })
    expect(requestMock).toHaveBeenCalledTimes(1)
    const cfg = requestMock.mock.calls[0][0]
    expect(cfg).toMatchObject({ url: 'auth/register', method: 'post', headers: { bot_type: 'B2C' } })
    expect(cfg.data).toEqual({
      name: 'Ali',
      phoneNumber: '900000102',
      verificationCode: '1234',
      companyCode: REGISTER_COMPANY_CODE
    })
  })
})
