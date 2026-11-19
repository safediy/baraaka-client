import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'

/**
 * A bot deep link (`/redirect/<hex>` → for example `/orders?id=7`) brings a client without a token to `/login`. The guard
 * keeps the page they were opening in `/login?redirect=...` (telegram-mode-auth.test.ts). Here: after the OTP or the
 * registration the client goes back to that page; a value that leads outside the app is not accepted.
 */

const verifyLogin = vi.fn()
const otpLogin = vi.fn()
const register = vi.fn()

vi.mock('@/api/AuthService', () => ({ default: { verifyLogin, sendVerificationCode: vi.fn(), getCaptcha: vi.fn() } }))
vi.mock('@/store/modules/user', () => ({ useUserStore: () => ({ otpLogin, register }) }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }))
vi.mock('element-plus', () => ({ ElMessage: { error: vi.fn(), success: vi.fn() } }))

const TARGET = '/orders?id=7'
const loginWith = (redirect: string) => `/login?redirect=${encodeURIComponent(redirect)}`

/** A router where any path resolves; the client is on `start` */
async function routerAt(start: string): Promise<Router> {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }]
  })
  await router.push(start)
  return router
}

const slot = { template: '<div><slot /></div>' }
const stubs = {
  'el-card': slot,
  'el-text': slot,
  // el-form's `@submit.prevent` falls through to the root <form>: submitting the form confirms
  'el-form': { template: '<form><slot /></form>' },
  'el-form-item': slot,
  'el-icon': slot,
  'el-button': { template: '<button type="button"><slot /></button>' },
  'el-link': slot,
  Refresh: true,
  Vue3OtpInput: true,
  ServerCaptcha: true,
  NameDetails: true
}

/** The OTP was entered (form submitted); the page the client ended up on */
async function confirmOtp(start: string) {
  const router = await routerAt(start)
  const Otp = (await import('@/views/auth/OtpVerification.vue')).default
  const w = mount(Otp, { props: { phone: '901234567' }, global: { plugins: [router], stubs } })
  await w.find('form').trigger('submit')
  await flushPromises()
  // unmount resets the router to its start location (/): read the page before it
  const landed = router.currentRoute.value.fullPath
  w.unmount()
  return landed
}

/** A new client entered a name and registered; the page they ended up on */
async function registerName(start: string) {
  const router = await routerAt(start)
  const Name = (await import('@/views/auth/NameDetails.vue')).default
  const w = mount(Name, { props: { phone: '901234567', otpCode: '1111' }, global: { plugins: [router], stubs } })
  await w.find('input.name-input').setValue('Ali Valiyev')
  await w.find('form').trigger('submit')
  await flushPromises()
  // unmount resets the router to its start location (/): read the page before it
  const landed = router.currentRoute.value.fullPath
  w.unmount()
  return landed
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
  verifyLogin.mockReset().mockResolvedValue({ token: 'JWT' })
  otpLogin.mockReset()
  register.mockReset().mockResolvedValue(undefined)
})
afterEach(() => vi.useRealTimers())

describe('returnPath', () => {
  it('returns only an in-app path, otherwise the fallback', async () => {
    const { returnPath } = await import('@/utils/return-path')
    const cases: Array<[unknown, string]> = [
      [TARGET, TARGET],
      [['/orders', '/home'], '/orders'],
      [undefined, '/'],
      [null, '/'],
      ['', '/'],
      ['orders', '/'],
      ['https://evil.example/x', '/'],
      ['//evil.example/x', '/'],
      ['/\\evil.example/x', '/'],
      // Browsers strip tab and newline from URLs: `/\t/evil` becomes `//evil`
      ['/\t/evil.example/x', '/'],
      ['/\n/evil.example/x', '/'],
      ['/login', '/'],
      ['/LOGIN', '/'],
      ['/login?redirect=%2Forders', '/']
    ]
    expect(cases.map(([value]) => [value, returnPath(value as never)])).toEqual(cases)
    expect(returnPath(undefined, '/home')).toBe('/home')
  })
})

describe('loginLocation', () => {
  it('keeps the page being opened in redirect, without the bot token (tokenKey)', async () => {
    const { loginLocation } = await import('@/utils/return-path')
    expect(loginLocation({ path: '/orders', query: { id: '7' }, hash: '' })).toEqual({
      path: '/login',
      query: { redirect: TARGET }
    })
    expect(loginLocation({ path: '/orders', query: { tokenKey: 'T', id: '7' }, hash: '' })).toEqual({
      path: '/login',
      query: { redirect: TARGET }
    })
    expect(loginLocation({ path: '/profil', query: {}, hash: '' })).toEqual({
      path: '/login',
      query: { redirect: '/profil' }
    })
  })
})

describe('OTP: existing client', () => {
  it('goes back to the redirect page after the code is confirmed', async () => {
    expect(await confirmOtp(loginWith(TARGET))).toBe(TARGET)
    expect(otpLogin).toHaveBeenCalledWith({ phoneNumber: '901234567', accessToken: 'JWT' })
  })

  it('without a redirect, or one outside the app: home page', async () => {
    expect(await confirmOtp('/login')).toBe('/')
    expect(await confirmOtp(loginWith('//evil.example/x'))).toBe('/')
  })
})

describe('registration: new client', () => {
  it('goes back to the redirect page after registering', async () => {
    expect(await registerName(loginWith(TARGET))).toBe(TARGET)
    expect(register).toHaveBeenCalledTimes(1)
  })

  it('without a redirect: /home', async () => {
    expect(await registerName('/login')).toBe('/home')
  })
})
