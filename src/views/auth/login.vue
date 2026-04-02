<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import './index.css'
import { useI18n } from 'vue-i18n'
import AuthService from '@/api/AuthService'
import uzFlag from '@/assets/layouts/uzFlag.svg'
import ruFlag from '@/assets/layouts/ruFlag.svg'
import engFlag from '@/assets/layouts/engFlag.svg'
import chinaFlag from '@/assets/layouts/chinaFlag.svg'
import OtpVerification from '@/views/auth/OtpVerification.vue'
import Logo from '@/assets/layouts/logo.svg'
import { useUserStore } from '@/store/modules/user'
import { getActiveLang } from '@/utils/cache/local-storage'
import ClientService from '@/api/ClientService'
import { formatPhoneInput } from '@/utils'
import { generateHmacHashKey } from '@/utils/helpers'
const { t } = useI18n()
const userStore = useUserStore()

const phoneNumber = ref('')
const isLoading = ref<boolean>(false)
const showOtpVerification = ref<boolean>(false)
const language = ref(userStore.language || getActiveLang())

// Captcha state
const captchaExpression = ref('')
const captchaAnswer = ref('')
const captchaUserInput = ref('')
const captchaError = ref('')

const languages = ref([
  { label: "O'zbekcha", value: 'uz', flag: uzFlag },
  { label: 'Русский', value: 'ru', flag: ruFlag },
  { label: 'English', value: 'en', flag: engFlag },
  { label: '中国人', value: 'zh', flag: chinaFlag }
])

// Generate captcha
const generateCaptcha = () => {
  const operations = ['+', '-', '×']
  const operation = operations[Math.floor(Math.random() * operations.length)]

  let num1: number, num2: number, answer: number, expression: string

  switch (operation) {
    case '+':
      num1 = Math.floor(Math.random() * 10) + 1
      num2 = Math.floor(Math.random() * 10) + 1
      answer = num1 + num2
      expression = `${num1} + ${num2} =`
      break
    case '-':
      num1 = Math.floor(Math.random() * 10) + 5
      num2 = Math.floor(Math.random() * 5) + 1
      answer = num1 - num2
      expression = `${num1} - ${num2} =`
      break
    case '×':
      num1 = Math.floor(Math.random() * 9) + 1
      num2 = Math.floor(Math.random() * 9) + 1
      answer = num1 * num2
      expression = `${num1} × ${num2} =`
      break
    default:
      num1 = 1
      num2 = 1
      answer = 2
      expression = '1 + 1 ='
  }

  captchaExpression.value = expression
  captchaAnswer.value = answer.toString()
  captchaUserInput.value = ''
  captchaError.value = ''
}

// Validate captcha
const validateCaptcha = () => {
  if (!captchaUserInput.value.trim()) {
    captchaError.value = t('captcha.required') || 'Captcha is required'
    return false
  }

  if (captchaUserInput.value.trim() !== captchaAnswer.value) {
    captchaError.value = t('captcha.incorrect') || 'Incorrect captcha'
    return false
  }

  captchaError.value = ''
  return true
}

// Initialize captcha on component mount
generateCaptcha()

const handleSubmit = async () => {
  isLoading.value = true

  // Validate phone number
  if (phoneNumber.value.length < 9) {
    isLoading.value = false
    ElMessage.error(t('require.phoneNumber'))
    return
  }

  // Validate captcha
  if (!validateCaptcha()) {
    isLoading.value = false
    return
  }

  try {
    await AuthService.sendVerificationCode({
      phone: phoneNumber.value.replace(/\D/g, ''),
      type: 'REGISTER',
      companyCode: '077',
      cProvider: 'math_arithmetic',
      _csrf: generateHmacHashKey(Number(captchaUserInput.value))
    })
    ElMessage.success(t('message.sendCode'))
    showOtpVerification.value = true
  } catch (error) {
    console.log('error', error)
    // Generate new captcha on error
    generateCaptcha()
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  showOtpVerification.value = false
}

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  phoneNumber.value = formatPhoneInput(target.value)
}
const changeLanguage = async (lang: any) => {
  userStore.setLanguage(lang)
  if (userStore?.token && userStore.clientId) {
    await ClientService.updateClientLang({
      id: userStore.clientId,
      language: lang
    })
  }
}
</script>

<template>
  <div class="auth-navbar client-container">
    <div class="auth-navbar-wrapper">
      <div class="auth-navbar-logo">
        <img :src="Logo" alt="" />
      </div>
      <div class="auth-navbar-actions">
        <!-- <template v-if="userStore?.clientCode">
          <el-link class="help-service"
            :href="`https://t.me/iPost_help?text=${t('helpMessage', { code: userStore.clientCode })}`"
            target="_blank">{{ t('helpService') }}</el-link>
          <el-link class="help-service help-service-call"
            :href="`https://t.me/iPost_help?text=${t('helpMessage', { code: userStore.clientCode })}`"
            target="_blank"><el-icon>
              <Phone />
            </el-icon></el-link>
        </template> -->
        <el-select class="lang-select" v-model="language" @change="changeLanguage" size="large" style="width: 100px">
          <template #prefix>
            <img :src="languages.find((lang) => lang.value === language)?.flag || ''" width="20" height="20" />
            <span style="margin-left: 5px">
              {{ languages.find((lang) => lang.value === language)?.value?.toUpperCase() || '' }}
            </span>
          </template>

          <el-option v-for="lang in languages" :key="lang.value" :label="lang.label" :value="lang.value">
            <div class="lang-option" style="display: flex; align-items: center; gap: 8px">
              <img :src="lang.flag" width="20" />
              <el-text tag="span" style="font-size: 14px; font-weight: 500; color: #111827">
                {{ lang.label }}
              </el-text>
              <el-icon v-if="language === lang.value">
                <Check />
              </el-icon>
            </div>
          </el-option>
        </el-select>
      </div>
    </div>
  </div>
  <el-card shadow="never" class="login-container">
    <el-card v-if="!showOtpVerification" shadow="never" class="login-card">
      <el-text tag="h5" class="form-title">{{ t('loginCabinetTitle') }}</el-text>
      <el-text tag="p" class="form-text">{{ t('continueMessage') }}</el-text>

      <el-form class="auth-form" label-position="top" @submit.prevent="handleSubmit">
        <el-form-item class="form-label" :label="t('phoneNumber')">
          <div class="phone-input-container">
            <span class="phone-prefix">+998</span>
            <input
              class="phone-input"
              v-model="phoneNumber"
              inputmode="numeric"
              type="text"
              :placeholder="t('phoneNumber')"
              @input="handleInput"
              maxlength="12"
            />
          </div>
        </el-form-item>

        <!-- Captcha Section -->
        <el-form-item class="form-label" :label="t('captcha.title') || 'Arifmetik ifoda'">
          <div class="captcha-container">
            <div class="captcha-expression">
              <span class="captcha-text">{{ captchaExpression }}</span>
              <button type="button" class="captcha-refresh" @click="generateCaptcha" :disabled="isLoading">
                <el-icon>
                  <Refresh />
                </el-icon>
              </button>
            </div>
            <input
              class="captcha-input"
              v-model="captchaUserInput"
              type="text"
              inputmode="numeric"
              :placeholder="t('captcha.placeholder') || 'Javobni kiriting'"
              @input="captchaError = ''"
              maxlength="3"
            />
          </div>
          <div v-if="captchaError" class="captcha-error">{{ captchaError }}</div>
        </el-form-item>

        <el-button native-type="submit" :loading="isLoading" class="submit-btn" @click="handleSubmit">{{
          t('continue')
        }}</el-button>
      </el-form>

      <el-text tag="p" class="terms-text">
        Kirishni bosish orqali siz
        <el-link type="primary" href="/" target="_blank">Oferta shartnomasi</el-link>
        va
        <el-link type="primary" href="/" target="_blank">Maxfiylik siyosati</el-link>
        ga rozilik bildirasiz
      </el-text>
    </el-card>
    <OtpVerification v-if="showOtpVerification" @goBack="goBack" :phone="phoneNumber.replace(/\D/g, '')" />
  </el-card>
</template>

<style lang="scss" scoped>
@mixin f-style($fSize, $fWeight, $color) {
  font-size: $fSize;
  font-weight: $fWeight;
  color: $color;
}

.auth-navbar-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 24px;
}

.auth-navbar-logo {
  width: 174px;
  height: 48px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.auth-navbar-actions {
  display: flex;
  align-items: center;
  column-gap: 10px;

  .help-service {
    border-radius: 12px;
    background-color: #030712;
    @include f-style(15px, 500, #fff);
    padding: 0px 20px;
    height: 40px;
  }

  .help-service-call {
    // display: none;
  }
}

:deep(.el-select) {
  width: 85px !important;
  height: 40px;
}

:deep(.el-select__prefix) {
  display: flex;
  align-items: center;
  gap: 2px;

  span {
    @include f-style(14px, 500, #111827);
    margin-top: 3px;
    margin-left: 2px;
  }
}

:deep(.el-select__wrapper) {
  border-radius: 12px;
  height: 40px;
  box-shadow: none;
  padding: 10px 8px;
}

.login-container {
  display: flex;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  align-items: center;
  background-color: #f2f3f5;
  border: none;
  height: 80%;
}

.login-card {
  flex: 1;
  max-width: 420px;
  width: 100%;
  padding: 8px 20px;
  border-radius: 24px;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  border: none;
}

.form-title {
  @include f-style(24px, 600, #111827);
  line-height: 34px;
  max-width: 192px;
}

.form-text {
  @include f-style(14px, 500, #9ca3af);
  line-height: 20px;
  margin-top: 8px;
}

.auth-form {
  width: 100%;

  .form-label {
    @include f-style(13px, 500, #9ca3af);
    margin-top: 18px;
  }
}

.phone-input-container {
  position: relative;
  width: 100% !important;
  display: flex;
  align-items: baseline;
  column-gap: 0.4rem;
  padding: 0 15px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  height: 45px;

  .phone-prefix {
    @include f-style(15px, 500, #111827);
  }

  .phone-input {
    width: 100% !important;
    height: 100%;
    border-radius: 16px !important;
    border: none !important;
    outline-style: none;
    @include f-style(15px, 500, #111827);

    &:focus {
      outline-color: none !important;
    }
  }
}

.captcha-container {
  width: 100%;
  display: flex;
  gap: 8px;
}

.captcha-expression {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  height: 45px;
  width: 170px;
  background-color: #f9fafb;
}

.captcha-text {
  @include f-style(15px, 500, #111827);
}

.captcha-refresh {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #e5e7eb;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .el-icon {
    font-size: 16px;
    color: #6b7280;
  }
}

.captcha-input {
  width: 100%;
  height: 45px;
  padding: 0 15px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  outline: none;
  @include f-style(15px, 500, #111827);
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #030712;
  }

  &::placeholder {
    @include f-style(15px, 400, #9ca3af);
  }
}

.captcha-error {
  @include f-style(12px, 400, #ef4444);
  margin-top: 4px;
  padding-left: 4px;
}

.submit-btn {
  @include f-style(15px, 500, #fff);
  width: 100%;
  background-color: #030712;
  border-radius: 16px;
  height: 44px;

  &:hover {
    opacity: 0.8;
  }
}

.terms-text {
  display: none;
  margin-top: 100px !important;
  line-height: 20px;
  @include f-style(14px, 400, #9ca3af);
}

@media only screen and (max-width: 558px) {
  .auth-navbar-logo {
    width: 154px;
    height: 45px;
  }

  .auth-navbar-actions {
    column-gap: 10px;

    .help-service {
      display: none;
    }

    .help-service-call {
      // display: flex;
      font-size: 18px;
      padding: 0 16px;
    }
  }

  :deep(.el-select) {
    width: 50px !important;
  }

  :deep(.el-select__selection) {
    display: none;
  }

  :deep(.el-select__prefix) {
    span {
      display: none;
    }
  }
}

@media screen and (max-width: 480px) {
  .login-card {
    padding: 0 16px;
  }

  .form-title {
    @include f-style(22px, 600, #111827);
    line-height: 32px;
  }

  .form-text {
    @include f-style(13px, 500, #9ca3af);
    line-height: 18px;
  }
}

@media screen and (max-width: 395px) {
  .auth-navbar-logo {
    width: 140px;
    height: 43px;
  }

  .login-card {
    padding: 0 8px;
  }

  .form-title {
    @include f-style(18px, 600, #111827);
    line-height: 30px;
  }

  .form-text {
    @include f-style(12px, 500, #9ca3af);
    line-height: 18px;
  }

  .auth-form {
    .form-label {
      @include f-style(12px, 500, #9ca3af);
      margin-top: 13px;
    }
  }

  .phone-input-container {
    column-gap: 0.3rem;
    padding: 0 13px;
    height: 42px;

    .phone-prefix {
      @include f-style(14px, 500, #111827);
    }

    .phone-input {
      @include f-style(14px, 500, #111827);
    }
  }

  .captcha-expression {
    padding: 0 13px;
    height: 42px;
  }

  .captcha-text {
    @include f-style(14px, 500, #111827);
  }

  .captcha-input {
    height: 42px;
    padding: 0 13px;
    @include f-style(14px, 500, #111827);

    &::placeholder {
      @include f-style(14px, 400, #9ca3af);
    }
  }

  .submit-btn {
    @include f-style(14px, 500, #fff);
    width: 100%;
    height: 42px;
  }
}

@media screen and (max-width: 318px) {
  .login-card {
    padding: 0 3px;
  }

  .form-title {
    @include f-style(18px, 600, #111827);
    line-height: 28px;
  }

  .form-text {
    @include f-style(11px, 500, #9ca3af);
    line-height: 18px;
  }

  .auth-form {
    .form-label {
      @include f-style(11px, 500, #9ca3af !important);
      margin-top: 13px;
    }
  }

  .phone-input-container {
    column-gap: 0.2rem;
    padding: 0 13px;
    height: 42px;

    .phone-prefix {
      @include f-style(13px, 500, #111827);
    }

    .phone-input {
      @include f-style(13px, 500, #111827);
    }
  }

  .captcha-expression {
    padding: 0 13px;
    height: 42px;
  }

  .captcha-text {
    @include f-style(13px, 500, #111827);
  }

  .captcha-input {
    height: 42px;
    padding: 0 13px;
    @include f-style(13px, 500, #111827);

    &::placeholder {
      @include f-style(13px, 400, #9ca3af);
    }
  }

  .submit-btn {
    @include f-style(14px, 500, #fff);
    width: 100%;
    height: 42px;
  }
}
</style>
