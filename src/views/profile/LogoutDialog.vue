<script setup lang="ts">
import { useUserStore } from '@/store/modules/user'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import LogoutIcon from '@/assets/svg/logout-light.svg'
import DynamicDialog from '@/components/DynamicDialog/DynamicDialog.vue'

const { t } = useI18n()
const router = useRouter()
const dialogVisible = ref<boolean>(false)
const isLoading = ref<boolean>(false)

const view = () => {
  dialogVisible.value = true
}

const handleCancel = () => {
  dialogVisible.value = false
}

const handleLogout = async () => {
  isLoading.value = true
  useUserStore().logout()
  router.push('/login')
  dialogVisible.value = false
  isLoading.value = false
}

defineExpose({
  view
})
const dialogStyle = {
  maxWidth: '440px',
  borderRadius: '24px'
}
</script>

<template>
  <DynamicDialog :position-style="dialogStyle" size="42%" v-model="dialogVisible" :title="t('logout.system')">
    <div class="logout-image">
      <img :src="LogoutIcon" />
    </div>
    <el-text class="confirm-text" tag="h5">{{ t('message.confirm.logout') }}</el-text>
    <div class="confirm-actions">
      <el-button @click="handleCancel" class="cancel-btn">{{ t('cancel') }}</el-button>
      <el-button @click="handleLogout" :loading="isLoading" class="logout-btn">{{ t('logout') }}</el-button>
    </div>
  </DynamicDialog>
</template>

<style scoped lang="scss">
@mixin f-style($fSize, $fWeight, $color) {
  font-size: $fSize;
  font-weight: $fWeight;
  color: $color;
}

.logout-image {
  width: 64px;
  height: 64px;
  margin: auto;
  display: none;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  background-color: #d81b51;
}

.confirm-text {
  @include f-style(16px, 500, #000000);
  margin-top: 18px;
}

.confirm-actions {
  display: flex;
  align-items: center;
  margin-top: 24px;
  gap: 8px;

  button {
    width: 100%;
    height: 48px;
    @include f-style(15px, 500, #111827);
    border-radius: 16px;
  }

  .cancel-btn {
    border: 1px solid #e5e7eb;
  }

  .logout-btn {
    background-color: #d81b51;
    color: #fff;
  }
}

@media only screen and (max-width: 770px) {
  .logout-image {
    display: flex;
  }

  .confirm-text {
    @include f-style(16px, 500, #000000);
    text-align: center;
    margin-top: 18px;
  }

  .confirm-actions button {
    @include f-style(14px, 600, #111827);
  }
}
</style>
