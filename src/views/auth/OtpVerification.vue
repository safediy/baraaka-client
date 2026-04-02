<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import Vue3OtpInput from 'vue3-otp-input'

import AuthService from '@/api/AuthService'
import { useRouter } from 'vue-router'
import NameDetails from './NameDetails.vue'
import { useUserStore } from '@/store/modules/user'
import { useI18n } from 'vue-i18n'
import { parseInitDataTelegram } from '@/utils/helpers'

const { t } = useI18n()
const props = defineProps<{ phone: string }>()
// const emit = defineEmits(['go-back'])
const router = useRouter()

const otpInput = ref('')
const bindValue = ref('2')
const isLoading = ref(false)
const timer = ref(60)
const isResendVisible = ref(false)
let interval: any = null
const isRegister = ref(false)

watch(otpInput, (newValue) => {
  console.log('OTP yangilandi:', newValue)
})

const formattedTimer = computed(() => {
  const minutes = Math.floor(timer.value / 60)
  const seconds = timer.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const startTimer = () => {
  isResendVisible.value = false
  timer.value = 60
  if (interval) clearInterval(interval)

  interval = setInterval(() => {
    if (timer.value > 0) {
      timer.value--
    } else {
      isResendVisible.value = true
      clearInterval(interval)
    }
  }, 1000)
}

const handleChange = (otpCode: string) => {
  bindValue.value = otpCode
}

const handleOnComplete = async () => {
  isLoading.value = true
  try {
    const webApp = window.Telegram.WebApp
    const telegramUser = parseInitDataTelegram(webApp.initData)

    const response: any = await AuthService.verifyLogin({
      phone: props?.phone,
      verificationCode: bindValue.value,
      chatId: telegramUser?.id
    })
    if (response.token) {
      ElMessage.success('Tasdiqlandi')
      useUserStore().otpLogin({
        phoneNumber: props?.phone,
        accessToken: response.token
      })
      router.push('/')
    } else {
      isRegister.value = true
    }
  } catch (error) {
    console.log(error)
    ElMessage.error('Tasdiqlash kodi xato')
  } finally {
    isLoading.value = false
  }
}

const handleResendOtpCode = async () => {
  isLoading.value = true
  bindValue.value = ''
  otpInput.value = ''
  try {
    await AuthService.sendVerificationCode({
      phone: props?.phone.replace(/\D/g, ''),
      type: 'REGISTER',
      companyCode: '077'
    })
    ElMessage.success('Tasdiqlash kodi yuborildi')
    startTimer()
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  startTimer()
  // Focus the first input after component mounts
  setTimeout(() => {
    const firstInput = document.querySelector('.otp-input input')
    if (firstInput) {
      ;(firstInput as HTMLInputElement).focus()
    }
  }, 100)
})
</script>

<template>
  <el-card v-if="!isRegister" shadow="never" class="otp-card">
    <el-button @click="$emit('go-back')" class="back-btn" type="text" icon="Back" />
    <el-text tag="h5" class="form-title">{{ t('require.confirmCode') }}</el-text>
    <el-text tag="p" class="text-number"> {{ t('codeSentTo') }} +998{{ phone }} </el-text>

    <el-form class="auth-fordm" label-position="top" @submit.prevent="handleOnComplete">
      <!-- <v-otp-input
        ref="otpInput"
        v-model:value="bindValue"
        input-classes="otp-input"
        inputType="number"
        :num-inputs="4"
        :should-auto-focus="true"
        :should-focus-order="true"
        @on-complete="handleOnComplete"
      /> -->
      <Vue3OtpInput
        v-model="bindValue"
        :length="4"
        type="number"
        inputmode="numeric"
        autocomplete="one-time-code"
        @on-change="handleChange"
        @on-complete="handleOnComplete"
        class="otp-input"
        ref="otpInput"
        :only-number="true"
        :separator="''"
        :auto-focus="true"
      />

      <button v-if="!isResendVisible" class="timer-btn" type="button">
        {{ formattedTimer }} {{ t('resendAfter') }}
      </button>
      <el-button v-else class="submit-btn" @click="handleResendOtpCode">{{ t('resend') }}</el-button>
    </el-form>
  </el-card>

  <NameDetails v-if="isRegister" :phone="phone" :otpCode="bindValue" />
</template>

<style scoped lang="scss">
@mixin f-style($fSize, $fWeight, $color) {
  font-size: $fSize;
  font-weight: $fWeight;
  color: $color;
}

:deep(.otp-input) {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 20px 0;
  width: 100% !important;
}

:deep(.otp-input input) {
  width: 58px !important;
  height: 58px !important;
  padding: 0;
  font-size: 22px;
  border-radius: 16px !important;
  border: 1px solid #e5e7eb;
  text-align: center;
  outline: none;
  background-color: #fff;
  inputmode: numeric;
  autocomplete: one-time-code;

  &:focus {
    border-color: #044ca2;
    box-shadow: 0 0 0 2px rgba(4, 76, 162, 0.1);
  }
}

.form-title {
  @include f-style(24px, 600, #111827);
  line-height: 34px;
  margin-top: 1rem;
}

.text-number {
  @include f-style(14px, 500, #9ca3af);
  line-height: 20px;
  margin-top: 8px;
}

.otp-card {
  position: relative;
  flex: 1;
  max-width: 420px;
  width: 100%;
  padding: 8px 20px;
  border-radius: 24px;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  border: none;
}

.back-btn {
  position: absolute;
  top: 8px;
  left: 5%;
  font-size: 20px;
  color: #111827;
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

.timer-btn {
  background-color: #f3f4f6;
  width: 100%;
  border-radius: 16px;
  padding: 0 10px;
  height: 44px;
  color: #c2c4c9;
  @include f-style(15px, 500, #9ca3af);
  border: none;

  &:hover {
    cursor: not-allowed;
  }
}

.form-terms-text {
  margin-top: 24px !important;
  line-height: 20px;
  @include f-style(13px, 400, #9ca3af);
}

@media only screen and (max-width: 480px) {
  .otp-card {
    padding: 8px 10px;
  }

  .form-title {
    @include f-style(20px, 600, #111827);
    line-height: 30px;
  }

  .text-number {
    @include f-style(13px, 500, #9ca3af);
    line-height: 20px;
    margin-top: 8px;
  }

  .timer-btn {
    @include f-style(13px, 500, #9ca3af);
    height: 42px;
  }
}

@media only screen and (max-width: 294px) {
  .otp-card {
    padding: 8px;
  }

  .form-title {
    @include f-style(17px, 600, #111827);
    line-height: 30px;
  }

  .text-number {
    @include f-style(12px, 500, #9ca3af);
    line-height: 20px;
    margin-top: 8px;
  }

  .submit-btn {
    @include f-style(14px, 500, #fff);
    height: 42px;
  }

  .timer-btn {
    @include f-style(12px, 500, #9ca3af);
    height: 40px;
  }
}
</style>
