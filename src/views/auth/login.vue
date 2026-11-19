<script setup lang="ts">
import { REGISTER_COMPANY_CODE } from '@/constants/company'
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
import { isCaptchaFailed } from '@/utils/helpers'
import ServerCaptcha from '@/views/auth/ServerCaptcha.vue'
const { t } = useI18n()
const userStore = useUserStore()

const phoneNumber = ref('')
const isLoading = ref<boolean>(false)
const showOtpVerification = ref<boolean>(false)
const language = ref(userStore.language || getActiveLang())

const captchaRef = ref<InstanceType<typeof ServerCaptcha> | null>(null)

const languages = ref([
  { label: "O'zbekcha", value: 'uz', flag: uzFlag },
  { label: 'Русский', value: 'ru', flag: ruFlag },
  { label: 'English', value: 'en', flag: engFlag },
  { label: '中国人', value: 'zh', flag: chinaFlag }
])

const handleSubmit = async () => {
  if (isLoading.value) return
  isLoading.value = true

  // Validate phone number
  if (phoneNumber.value.length < 9) {
    isLoading.value = false
    ElMessage.error(t('require.phoneNumber'))
    return
  }

  // Validate captcha
  if (!captchaRef.value?.validate()) {
    isLoading.value = false
    return
  }

  try {
    await AuthService.sendVerificationCode({
      phone: phoneNumber.value.replace(/\D/g, ''),
      type: 'REGISTER',
      companyCode: REGISTER_COMPANY_CODE,
      captchaId: captchaRef.value!.captchaId,
      captchaAnswer: captchaRef.value!.captchaAnswer.trim()
    })
    ElMessage.success(t('message.sendCode'))
    showOtpVerification.value = true
  } catch (error) {
    console.log('error', error)
    // A captcha is single-use: always fetch a new one after a failed attempt
    const failed = isCaptchaFailed(error)
    await captchaRef.value?.reload()
    if (failed) captchaRef.value?.setError(t('captcha.incorrect') || 'Incorrect captcha')
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

        <ServerCaptcha ref="captchaRef" :disabled="isLoading" />
        <el-button native-type="submit" :loading="isLoading" class="submit-btn">{{
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
