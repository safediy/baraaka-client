<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  phone: {
    type: String,
    required: true
  },
  otpCode: {
    type: String,
    required: true
  }
})
const emit = defineEmits(['go-back'])
const isLoading = ref(false)
const router = useRouter()

const formData = ref({
  name: '',
  phoneNumber: props.phone.replace(/\D/g, ''),
  verificationCode: props.otpCode
})

const handleSaveDetails = async () => {
  isLoading.value = true
  if (formData.value.name.length < 3) {
    isLoading.value = false
    ElMessage.error('Kamida 3 ta harf kiriting')
    return
  }
  try {
    await useUserStore().register(formData.value)
    ElMessage.success("Foydalanuvchi muvaffaqiyatli ro'yxatdan o'tdi.")
    router.push('/home')
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <el-card shadow="never" class="login-container">
    <el-card shadow="never" class="login-card">
      <el-text tag="h5" class="form-title">{{ t('username') }}</el-text>
      <el-text tag="p" class="text-number">{{ t('enterFullName') }}</el-text>

      <el-form class="auth-form" label-position="top" @submit.prevent="handleSaveDetails">
        <el-form-item class="form-label" :label="t('username')">
          <input class="name-input" v-model="formData.name" :placeholder="t('require.username')" />
        </el-form-item>
        <el-button :loading="isLoading" class="submit-btn" @click="handleSaveDetails">{{ t('continue') }}</el-button>
      </el-form>

      <el-text tag="p" class="terms-text">
        Kirishni bosish orqali siz
        <el-link type="primary" href="/" target="_blank">Oferta shartnomasi</el-link>
        va
        <el-link type="primary" href="/" target="_blank">Maxfiylik siyosati</el-link>
        ga rozilik bildirasiz
      </el-text>
    </el-card>
  </el-card>
</template>

<style lang="scss" scoped>
@mixin f-style($fSize, $fWeight, $color) {
  font-size: $fSize;
  font-weight: $fWeight;
  color: $color;
}

.login-container {
  display: flex;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  align-items: center;
  background-color: #f2f3f5;
  border: none;
  height: 90%;
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
}

.text-number {
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

.name-input {
  width: 100% !important;
  height: 45px;
  border-radius: 16px !important;
  outline-style: none;
  border: 1px solid #e5e7eb;
  padding: 0 15px;
  @include f-style(15px, 500, #111827);

  &:focus {
    outline-color: none !important;
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

@media only screen and (max-width: 400px) {
  .login-card {
    padding: 8px 14px;
  }

  .form-title {
    @include f-style(22px, 600, #111827);
    line-height: 32px;
  }

  .text-number {
    @include f-style(13px, 500, #9ca3af);
    line-height: 18px;
    margin-top: 8px;
  }

  .auth-form {
    .form-label {
      @include f-style(12px, 500, #9ca3af);
      margin-top: 18px;
    }
  }

  .name-input {
    height: 42px;
    padding: 0 13px;
    @include f-style(14px, 500, #111827);
  }
}

@media only screen and (max-width: 400px) {
  .login-card {
    padding: 8px 10px;
  }

  .form-title {
    @include f-style(18px, 600, #111827);
    line-height: 32px;
  }

  .text-number {
    @include f-style(11px, 500, #9ca3af);
    line-height: 16px;
    margin-top: 8px;
  }

  .auth-form {
    .form-label {
      @include f-style(12px, 500, #9ca3af !important);
      margin-top: 15px;
    }
  }

  .name-input {
    height: 40px;
    padding: 0 13px;
    @include f-style(13px, 500, #111827);
  }

  .submit-btn {
    @include f-style(14px, 500, #fff);
    height: 42px;
  }
}
</style>
