<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import DynamicDialog from '@/components/DynamicDialog/DynamicDialog.vue'
import ClientService from '@/api/ClientService'
import { CashbackItemDTO } from 'types/api'
import RefereddedClientDialog from './RefereddedClientDialog.vue'

const { t } = useI18n()
const route = useRoute()

const telegramService = window.Telegram

const drawerVisible = ref<boolean>(true)
const cashbackData = ref<CashbackItemDTO>()
const referredClientDialog = ref()

const view = () => {
  drawerVisible.value = true
  // fetchClientCashback()
}

const close = () => {
  drawerVisible.value = false
  telegramService.WebApp.close()
}

const fetchClientCashback = async () => {
  try {
    const promoCode = route.query.inviteCode as string
    const response = await ClientService.getCashbackBonuses({ promoCode })
    cashbackData.value = response
  } catch (error) {
    console.log(error)
  }
}

defineExpose({
  view,
  close
})

onMounted(() => {
  fetchClientCashback()
})

const handleView = () => {
  const promoCode = route.query.inviteCode as string
  referredClientDialog.value?.view({ promoCode })
}
</script>

<template>
  <DynamicDialog :title="t('myPromoCode')" v-model="drawerVisible" size="100%" :show-close="false">
    <div class="promo-code-dialog">
      <div class="dialog-content-wrapper">
        <div class="content-card" @click="handleView">
          <strong class="card-title">{{ t('totalInvited') }}</strong>
          <p class="card-value">{{ cashbackData?.totalReferredCount ?? 0 }}</p>
        </div>
        <div class="content-card">
          <strong class="card-title">{{ t('totalOrdersKg') }}</strong>
          <p class="card-value">{{ cashbackData?.totalWeight ?? 0 }} kg</p>
        </div>
        <div class="content-card">
          <strong class="card-title">{{ t('totalCashback') }}</strong>
          <p class="card-value">{{ cashbackData?.totalAmount ?? 0 }} $</p>
        </div>
      </div>
      <button @click="close" class="back-btn">{{ t('go.back') }}</button>
    </div>
  </DynamicDialog>

  <RefereddedClientDialog ref="referredClientDialog" />
</template>

<style lang="scss">
@mixin f-style($fSize, $fWeight, $color) {
  font-size: $fSize;
  font-weight: $fWeight;
  color: $color;
}

.promo-code-dialog {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  height: 100%;
}

.dialog-content-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 8px;

  .content-card {
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    padding: 16px;
    height: 140px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;

    .card-title {
      @include f-style(15px, 500, #111827);
      line-height: 120%;
    }

    .card-value {
      @include f-style(17px, 700, #111827);
    }
  }

  .content-card:nth-child(1) {
    grid-column: 1;
    grid-row: 1;
  }

  .content-card:nth-child(2) {
    grid-column: 2;
    grid-row: 1;
  }

  .content-card:nth-child(3) {
    grid-column: 1 / 3;
    grid-row: 2;
  }
}

.el-drawer__body {
  overflow: visible !important;
  padding-bottom: 14px !important;
}

.dialog-drawer.el-drawer.btt.open {
  height: fit-content !important;
}

.el-drawer__title {
  margin-top: 1rem;
}

.back-btn {
  width: 100%;
  background-color: #111827;
  border-radius: 16px;
  @include f-style(14px, 600, #fff);
  height: 48px;
  border: none;
}

@media only screen and (max-width: 770px) {
  .back-btn {
    border-radius: 32px;
  }
}
</style>
