<script setup lang="ts">
import { ref } from 'vue'
import CheckSvg from '@/assets/svg/check.svg'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const visible = ref<boolean>(false)

const open = () => {
  visible.value = true
  setTimeout(() => (visible.value = false), 3000)
}
defineExpose({ open })
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="custom-toast">
        <div class="toast-content">
          <div class="content-info">
            <img :src="CheckSvg" class="toast-icon" width="25" height="25" />
            <div class="toast-info">
              <p class="toast-title">{{ t('status.success') }}</p>
              <p class="toast-message">({{ t('tracking.addRequestAccepted') }})</p>
            </div>
          </div>
          <el-icon class="close-btn">
            <CloseBold @click="visible = false" />
          </el-icon>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
@mixin f-style($fSize, $fWeight, $color) {
  font-size: $fSize;
  font-weight: $fWeight;
  color: $color;
}

.custom-toast {
  width: 100%;
  max-width: 380px;
  position: fixed;
  top: 20px;
  right: 20px;
  background: #111827e5;
  color: #ffffff;
  padding: 16px;
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  z-index: 9999;
  height: 70px;

  @media only screen and (max-width: 578px) {
    max-width: calc(100% - 28px);
    left: 14px;
    right: 14px;
    padding: 14px;
    top: 16px;
  }
}

.toast-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.content-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toast-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  height: 100%;
  margin-top: 8px;
}

.toast-icon {
  font-size: 18px;
  color: #c4c4c4;
}

.toast-title {
  @include f-style(14px, 500, #ffffff);
  margin: 0;
}

.toast-message {
  margin-top: 5px;
  @include f-style(12px, 500, #9ca3af);
}

/* Fade Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.close-btn {
  @include f-style(18px, 500, #6b7280);
  cursor: pointer;
}
</style>
