<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AuthService from '@/api/AuthService'
import { svgToBase64 } from '@/utils/helpers'

defineProps<{ disabled?: boolean }>()

const { t } = useI18n()

const captchaId = ref('')
const captchaSvg = ref('')
const captchaAnswer = ref('')
const captchaError = ref('')
const captchaLoading = ref(false)

// Load a fresh captcha; the previous captchaId is dropped so it is never resent
const reload = async () => {
  captchaLoading.value = true
  captchaId.value = ''
  captchaSvg.value = ''
  captchaAnswer.value = ''
  captchaError.value = ''
  try {
    const res = await AuthService.getCaptcha()
    captchaId.value = res.captchaId
    captchaSvg.value = res.svg
  } catch (error) {
    console.log('captcha error', error)
    captchaError.value = t('captcha.loadFailed') || 'Captcha could not be loaded'
  } finally {
    captchaLoading.value = false
  }
}

const validate = () => {
  if (!captchaId.value || !captchaAnswer.value.trim()) {
    captchaError.value = t('captcha.required') || 'Captcha is required'
    return false
  }
  captchaError.value = ''
  return true
}

const setError = (message: string) => {
  captchaError.value = message
}

onMounted(reload)

defineExpose({ captchaId, captchaAnswer, reload, validate, setError })
</script>

<template>
  <el-form-item class="form-label" :label="t('captcha.title') || 'Captcha'">
    <div class="captcha-container">
      <div class="captcha-expression">
        <img
          v-if="captchaSvg"
          class="captcha-img"
          alt="captcha"
          :src="'data:image/svg+xml;base64,' + svgToBase64(captchaSvg)"
        />
        <button type="button" class="captcha-refresh" @click="reload" :disabled="disabled || captchaLoading">
          <el-icon>
            <Refresh />
          </el-icon>
        </button>
      </div>
      <input
        class="captcha-input"
        v-model="captchaAnswer"
        type="text"
        inputmode="numeric"
        :placeholder="t('captcha.placeholder') || 'Javobni kiriting'"
        @input="captchaError = ''"
        maxlength="4"
      />
    </div>
    <div v-if="captchaError" class="captcha-error">{{ captchaError }}</div>
  </el-form-item>
</template>

<style lang="scss" scoped>
@mixin f-style($fSize, $fWeight, $color) {
  font-size: $fSize;
  font-weight: $fWeight;
  color: $color;
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

.captcha-img {
  height: 36px;
  max-width: 110px;
  object-fit: contain;
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

@media only screen and (max-width: 558px) {
  .captcha-expression {
    padding: 0 13px;
    height: 42px;
  }

  .captcha-input {
    height: 42px;
    padding: 0 13px;
  }
}
</style>
