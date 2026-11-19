import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const getCaptchaMock = vi.fn()
const sendCodeMock = vi.fn()

vi.mock('@/api/AuthService', () => ({
  default: {
    getCaptcha: (...a: any[]) => getCaptchaMock(...a),
    sendVerificationCode: (...a: any[]) => sendCodeMock(...a)
  }
}))
vi.mock('@/api/ClientService', () => ({ default: {} }))
vi.mock('@/store/modules/user', () => ({
  useUserStore: () => ({ language: 'uz', setLanguage: vi.fn() })
}))
vi.mock('@/utils/cache/local-storage', () => ({ getActiveLang: () => 'uz' }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }))
vi.mock('element-plus', () => ({ ElMessage: { error: vi.fn(), success: vi.fn() } }))
vi.mock('@/views/auth/OtpVerification.vue', () => ({
  default: { name: 'OtpVerification', template: '<div class="otp-stub" />' }
}))

const passthrough = { template: '<div><slot /></div>' }
const stubs = {
  'el-card': passthrough,
  'el-text': passthrough,
  'el-form': { template: '<form><slot /></form>' },
  'el-form-item': passthrough,
  'el-select': passthrough,
  'el-option': passthrough,
  'el-link': passthrough,
  'el-icon': passthrough,
  Refresh: true,
  Check: true,
  'el-button': { template: '<button class="submit-btn" type="submit"><slot /></button>' }
}

const CAPTCHA_ERR = { response: { status: 401, data: { statusCode: 401, error: 'CAPTCHA_FAILED', message: { ru: 'Пожалуйста, попробуйте снова.', uz: "Iltimos, qayta urinib ko'ring.", en: 'Please try again.' } } } }
const svgA = '<svg xmlns="http://www.w3.org/2000/svg"><text>3 + 4 = ?</text></svg>'
const svgB = '<svg xmlns="http://www.w3.org/2000/svg"><text>9 − 2 = ?</text></svg>'

async function mountLogin() {
  const Login = (await import('@/views/auth/login.vue')).default
  const w = mount(Login, { global: { stubs } })
  await flushPromises()
  return w
}

async function fillAndSubmit(w: any, answer: string) {
  await w.find('.phone-input').setValue('901234567')
  await w.find('.captcha-input').setValue(answer)
  await w.find('form').trigger('submit')
  await flushPromises()
}

describe('server captcha on login page', () => {
  beforeEach(() => {
    getCaptchaMock.mockReset()
    sendCodeMock.mockReset()
    getCaptchaMock.mockResolvedValueOnce({ captchaId: 'id-1', svg: svgA })
    sendCodeMock.mockResolvedValue({})
  })

  it('loads captcha on mount and shows it as a base64 svg image', async () => {
    const w = await mountLogin()
    expect(getCaptchaMock).toHaveBeenCalledTimes(1)
    const src = w.find('img.captcha-img').attributes('src')!
    expect(src.startsWith('data:image/svg+xml;base64,')).toBe(true)
    expect(w.html()).not.toContain('<text>')
  })

  it('encodes non-Latin svg content safely', async () => {
    getCaptchaMock.mockReset()
    getCaptchaMock.mockResolvedValueOnce({ captchaId: 'id-b', svg: svgB })
    const w = await mountLogin()
    const b64 = w.find('img.captcha-img').attributes('src')!.split(',')[1]
    expect(new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)))).toBe(svgB)
  })

  it('submits captchaId and captchaAnswer without _csrf or cProvider', async () => {
    const w = await mountLogin()
    await fillAndSubmit(w, '7')
    expect(sendCodeMock).toHaveBeenCalledTimes(1)
    const payload = sendCodeMock.mock.calls[0][0]
    expect(payload).toMatchObject({ captchaId: 'id-1', captchaAnswer: '7', type: 'REGISTER' })
    expect(payload).not.toHaveProperty('_csrf')
    expect(payload).not.toHaveProperty('cProvider')
  })

  it('on CAPTCHA_FAILED reloads captcha, clears the answer and never resends the old captchaId', async () => {
    sendCodeMock.mockRejectedValueOnce(CAPTCHA_ERR)
    getCaptchaMock.mockResolvedValueOnce({ captchaId: 'id-2', svg: svgB })
    const w = await mountLogin()
    await fillAndSubmit(w, '5')
    expect(getCaptchaMock).toHaveBeenCalledTimes(2)
    expect((w.find('.captcha-input').element as HTMLInputElement).value).toBe('')
    await fillAndSubmit(w, '7')
    expect(sendCodeMock).toHaveBeenCalledTimes(2)
    expect(sendCodeMock.mock.calls[0][0].captchaId).toBe('id-1')
    expect(sendCodeMock.mock.calls[1][0].captchaId).toBe('id-2')
  })

  it('shows the incorrect captcha message after CAPTCHA_FAILED', async () => {
    sendCodeMock.mockRejectedValueOnce(CAPTCHA_ERR)
    getCaptchaMock.mockResolvedValueOnce({ captchaId: 'id-2', svg: svgB })
    const w = await mountLogin()
    await fillAndSubmit(w, '5')
    expect(w.find('.captcha-error').text()).toBe('captcha.incorrect')
  })

  it('refresh button fetches a new captcha', async () => {
    getCaptchaMock.mockResolvedValueOnce({ captchaId: 'id-3', svg: svgB })
    const w = await mountLogin()
    await w.find('.captcha-refresh').trigger('click')
    await flushPromises()
    expect(getCaptchaMock).toHaveBeenCalledTimes(2)
  })
})

describe('AuthService.getCaptcha', () => {
  it('calls GET auth/captcha', async () => {
    vi.resetModules()
    vi.doUnmock('@/api/AuthService')
    const requestMock = vi.fn().mockResolvedValue({})
    vi.doMock('@/utils/service', () => ({ request: requestMock }))
    const real = await vi.importActual<any>('@/api/AuthService')
    await real.default.getCaptcha()
    expect(requestMock.mock.calls[0][0]).toMatchObject({ url: 'auth/captcha', method: 'get' })
  })
})

describe('legacy secret removal', () => {
  it('no VITE_SMS_SECRET_KEY left in source, types, or build config', () => {
    const root = join(__dirname, '..')
    const hits: string[] = []
    const walk = (p: string) => {
      for (const n of readdirSync(p)) {
        if (['node_modules', 'dist', '.git'].includes(n)) continue
        const f = join(p, n)
        if (statSync(f).isDirectory()) walk(f)
        else if (/\.(ts|vue|js|toml|json|yml|yaml|example|md)$/.test(n) && n !== 'server-captcha.test.ts') {
          if (readFileSync(f, 'utf8').includes('VITE_SMS_SECRET_KEY')) hits.push(f)
        }
      }
    }
    for (const d of ['src', 'types', 'scripts']) walk(join(root, d))
    for (const f of ['netlify.toml', '.env.example', 'vite.config.ts', 'Dockerfile', 'docker-compose.yml', 'docker-compose-staging.yml'])
      try {
        if (readFileSync(join(root, f), 'utf8').includes('VITE_SMS_SECRET_KEY')) hits.push(f)
      } catch {}
    expect(hits).toEqual([])
  })
})

describe('OTP resend goes through the server captcha', () => {
  beforeEach(() => {
    getCaptchaMock.mockReset()
    sendCodeMock.mockReset()
    sendCodeMock.mockResolvedValue({})
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
  })
  afterEach(() => vi.useRealTimers())

  async function mountOtp() {
    vi.resetModules()
    vi.doMock('@/api/AuthService', () => ({
      default: {
        getCaptcha: (...a: any[]) => getCaptchaMock(...a),
        sendVerificationCode: (...a: any[]) => sendCodeMock(...a)
      }
    }))
    vi.doMock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))
    vi.doMock('vue3-otp-input', () => ({ default: { template: '<div />' } }))
    vi.doMock('@/views/auth/NameDetails.vue', () => ({ default: { template: '<div />' } }))
    vi.doMock('@/views/auth/ServerCaptcha.vue', async () => vi.importActual('@/views/auth/ServerCaptcha.vue'))
    const Otp = (await vi.importActual<any>('@/views/auth/OtpVerification.vue')).default
    const w = mount(Otp, { props: { phone: '901234567' }, global: { stubs } })
    await flushPromises()
    expect(w.find('.captcha-input').exists()).toBe(false)
    vi.advanceTimersByTime(61000)
    await flushPromises()
    return w
  }

  it('resend sends captchaId/captchaAnswer; failure reloads a new captcha', async () => {
    getCaptchaMock.mockResolvedValueOnce({ captchaId: 'r-1', svg: svgA })
    getCaptchaMock.mockResolvedValueOnce({ captchaId: 'r-2', svg: svgB })
    sendCodeMock.mockRejectedValueOnce(CAPTCHA_ERR)
    const w = await mountOtp()
    expect(getCaptchaMock).toHaveBeenCalledTimes(1)
    await w.find('.captcha-input').setValue('7')
    await w.findAll('button.submit-btn').at(-1)!.trigger('click')
    await flushPromises()
    expect(sendCodeMock.mock.calls[0][0]).toMatchObject({ captchaId: 'r-1', captchaAnswer: '7', type: 'REGISTER' })
    expect(sendCodeMock.mock.calls[0][0]).not.toHaveProperty('_csrf')
    expect(getCaptchaMock).toHaveBeenCalledTimes(2)
    expect((w.find('.captcha-input').element as HTMLInputElement).value).toBe('')
    await w.find('.captcha-input').setValue('8')
    await w.findAll('button.submit-btn').at(-1)!.trigger('click')
    await flushPromises()
    expect(sendCodeMock.mock.calls[1][0].captchaId).toBe('r-2')
  })
})

describe('isCaptchaFailed', () => {
  it('matches only response.data.error === CAPTCHA_FAILED', async () => {
    const { isCaptchaFailed } = await import('@/utils/helpers')
    expect(isCaptchaFailed(CAPTCHA_ERR)).toBe(true)
    expect(isCaptchaFailed({ response: { data: { error: 'OTHER', message: {} } } })).toBe(false)
    expect(isCaptchaFailed({ response: { data: { message: 'CAPTCHA_FAILED' } } })).toBe(false)
    expect(isCaptchaFailed({ response: { data: 'CAPTCHA_FAILED' } })).toBe(false)
    expect(isCaptchaFailed(null)).toBe(false)
  })
})
