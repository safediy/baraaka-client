<script setup lang="ts">
import { ref, PropType, computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import PaymeIcon from '@/assets/svg/payme.svg'
import CashIcon from '@/assets/svg/cash.svg'
import MassBoldIcon from '@/assets/svg/massBold.svg'
import TrackBoldIcon from '@/assets/svg/trackBold.svg'
import ShareIcon from '@/assets/svg/share.svg'

import { formattedNumber } from '@/utils'
import DynamicDialog from '@/components/DynamicDialog/DynamicDialog.vue'
import { WaybillInfoDTO } from 'types/waybill'

const dialogVisible = ref<boolean>(false)
const selectedPaymentMethod = ref<string>('Payme')
const isLoading = ref<boolean>(false)

const { t } = useI18n()

const props = defineProps({
  paidData: {
    type: Array as PropType<WaybillInfoDTO[]>,
    default: () => []
  }
})

const paymentData = reactive<any>({})

const view = (payment: any) => {
  dialogVisible.value = true
  Object.assign(paymentData, payment)
}

const handlePaymentSelection = (paymentMethod: string) => {
  selectedPaymentMethod.value = paymentMethod
}

const totalValues = computed(() => {
  const result = props.paidData.reduce(
    (acc, item) => {
      acc.weight += item.weight ?? 0
      acc.payAmountSom += item.payAmountSom ?? 0
      return acc
    },
    { weight: 0, payAmountSom: 0 }
  )

  result.weight = parseFloat(result.weight.toFixed(2))
  return result
})

const telegramService = window.Telegram

function openPayment() {
  window.open(paymentData[0].url, '_blank')

  // 1-2 soniyadan keyin Telegram Mini App’ni yopish:
  setTimeout(() => {
    telegramService.WebApp.close()
  }, 1500)
}

defineExpose({
  view
})
</script>

<template>
  <DynamicDialog size="95%" v-model="dialogVisible" :title="t('payment')">
    <div class="dialog-content">
      <div class="dialog-content__context">
        <el-text class="list-title">{{ t('trackingNumbers') }}:</el-text>
        <div class="trackNumber-list-card-wrapper">
          <div class="trackNumber-list-cards">
            <div v-for="(item, index) in props?.paidData" :key="index" class="list-item">
              <p class="track-number-text">{{ item.trackingNumber }}</p>
              <div class="item-details">
                <!-- <div class="detail-item">
                  <img :src="MassIcon">
                  <span>{{ item.weight || 0 }} {{ t("kg") }}</span>
                </div> -->
                <!-- <div class="detail-item">
                  <img :src="TrackIcon">
                  <span>{{ formattedNumber(item.payAmountSom) || 0 }} {{ t('sum') }}</span>
                </div> -->
              </div>
            </div>
          </div>
          <div class="total-item">
            <p class="total-text">{{ t('total') }}:</p>
            <div class="total-details">
              <div class="detail-item">
                <img :src="MassBoldIcon" />
                <span>{{ totalValues.weight }} {{ t('kg') }}</span>
              </div>
              <div class="detail-item">
                <img :src="TrackBoldIcon" />
                <span>{{ formattedNumber(totalValues.payAmountSom) }} {{ t('sum') }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="payment-actions">
          <el-text class="payment-title" tag="span">{{ t('paymentMethod') }}</el-text>
          <div class="payment-types">
            <div
              :class="{ 'selected-payment': selectedPaymentMethod === 'Payme' }"
              @click="handlePaymentSelection('Payme')"
              class="payment-item"
            >
              <img style="width: 24px; height: 24px" :src="PaymeIcon" />
              <div class="info">
                <p class="card-type">Payme</p>
                <span>O’zbekiston</span>
              </div>
            </div>
            <div class="payment-item" style="opacity: 0.7">
              <img style="width: 24px; height: 24px" :src="CashIcon" />
              <div class="info">
                <p class="card-type">{{ t('inCash') }}</p>
                <span>Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="dialog-content__actions">
        <a class="share-btn" :href="`https://t.me/share/url?url=${paymentData[0].url}`">
          {{ t('share') }} <img :src="ShareIcon" :alt="ShareIcon" />
        </a>
        <el-button @click="openPayment" :loading="isLoading" class="confirm-btn"
          >{{ t('pay') }} • {{ formattedNumber(totalValues.payAmountSom) }} {{ t('sum') }}</el-button
        >
      </div>
    </div>
  </DynamicDialog>
</template>

<style lang="scss" scoped>
@mixin f-style($fSize, $fWeight, $color) {
  font-size: $fSize;
  font-weight: $fWeight;
  color: $color;
}

.dialog-content {
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between;
  width: 100%;
  height: 100%;

  img {
    width: 20px;
  }

  &__context {
    width: 100%;
  }

  &__actions {
    display: grid;
    align-items: center;
    grid-template-columns: 1fr 1fr;
    width: 100%;
    gap: 8px;
    margin-top: 1rem;

    .confirm-btn {
      background-color: #111827;
      color: #fff;
      width: 100%;
      @include f-style(14px, 600, #ffffff);
      height: 48px;
    }

    .share-btn {
      width: 100%;
      display: flex;
      align-items: center;
      @include f-style(14px, 600, #111827);
      border: 1px solid #e5e7eb;
      justify-content: center;
      gap: 8px;
      height: 48px;
      border-radius: 16px;
    }
  }
}

.list-title {
  @include f-style(14px, 500, #6b7280);
}

.trackNumber-list-card-wrapper {
  margin-top: 10px;

  border-radius: 16px;
  // height: 200px;
  // overflow-y: auto;
  border: 1px solid #e5e7eb;
  padding: 0;

  p {
    @include f-style(13px, 500, #6b7280);
  }
}

.trackNumber-list-cards {
  max-height: 180px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar {
    width: 3px;
  }

  &::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c3c5c8;
    border-radius: 10px;
    transition: background 0.3s;
  }

  &::-webkit-scrollbar-corner {
    background: transparent;
  }
}

.list-item {
  width: 100%;
  display: flex;
  padding: 14px 16px;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none !important;
  }

  .track-number-text {
    @include f-style(14px, 600, #111827);
  }
}

.item-details {
  display: flex;
  align-items: center;
  gap: 10px;

  .detail-item {
    display: flex;
    gap: 4px;
    align-items: center;

    img {
      width: 20px;
      height: 20px;
    }

    span {
      @include f-style(14px, 500, #6b7280);
    }
  }
}

.total-item {
  width: 100%;
  display: flex;
  padding: 12px 16px;
  justify-content: space-between;
  background-color: #f9fafb;
  border-bottom-right-radius: 16px;
  border-bottom-left-radius: 16px;

  .total-text {
    @include f-style(15px, 500, #111827);
  }

  .total-details {
    display: flex;
    align-items: center;
    gap: 10px;

    .detail-item {
      display: flex;
      gap: 4px;
      align-items: center;

      img {
        width: 20px;
        height: 20px;
      }

      span {
        @include f-style(14px, 600, #111827);
      }
    }
  }
}

.payment-actions {
  margin-top: 20px;

  .payment-title {
    @include f-style(14px, 500, #6b7280);
  }
}

.payment-types {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  .payment-item {
    display: flex;
    align-items: center;
    cursor: pointer;
    gap: 10px;
    width: 100%;
    border-radius: 16px;
    border: 1px solid #e5e7eb;
    padding: 12px;

    &:hover {
      background-color: #f7f8f8e1;
    }

    .info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;

      .card-type {
        @include f-style(14px, 500, #111827);
      }

      span {
        @include f-style(12px, 500, #9ca3af);
      }
    }
  }
}

.selected-payment {
  border: 2px solid #044ca2 !important;
  cursor: context-menu !important;

  &:hover {
    background-color: transparent !important;
  }
}

@media only screen and (max-width: 770px) {
  .payment-types,
  .total-item {
    flex-direction: column;
    gap: 8px;
  }

  .dialog-content {
    &__actions {
      grid-template-columns: 1fr;

      .share-btn {
        background: #f3f4f6;
        border-radius: 32px;
        border: 1px solid #ffffff;
        order: 1;
      }
    }
  }
}
</style>
