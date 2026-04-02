<script lang="ts" setup>
import { formattedNumber } from '@/utils'
import { reactive, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import MassIcon from '@/assets/svg/mass.svg'
import TrackIcon from '@/assets/svg/track.svg'
import DynamicDialog from '@/components/DynamicDialog/DynamicDialog.vue'

const { t } = useI18n()

interface FormType {
  height: number
  weight: number
  width: number
  volume: number
  length: number
}

const form = reactive<FormType>({
  height: 0,
  weight: 0,
  width: 0,
  volume: 0,
  length: 0
})

// USD to Uzbek Sum exchange rate
const USD_TO_UZS = 12950

const PRICE_PER_KG = 6 // $6 per kg when no dimensions provided

// Weight range pricing tiers in USD
const WEIGHT_PRICE_TIERS = [
  { minKg: 1, maxKg: 170, price: 700 },
  { minKg: 170, maxKg: 200, price: 730 },
  { minKg: 200, maxKg: 250, price: 760 },
  { minKg: 250, maxKg: 300, price: 790 },
  { minKg: 300, maxKg: 350, price: 820 },
  { minKg: 350, maxKg: 400, price: 850 },
  { minKg: 400, maxKg: 500, price: 880 },
  { minKg: 500, maxKg: 600, price: 910 },
  { minKg: 600, maxKg: 800, price: 940 },
  { minKg: 800, maxKg: 1000, price: 970 },
  { minKg: 1000, maxKg: 100000, price: 950 }
]

const hasDimensions = computed<boolean>(() => {
  return !!form.length && !!form.width && !!form.height
})

const calculatedCube = computed<number>(() => {
  if (!hasDimensions.value) return 0
  return (form.length * form.width * form.height) / 1000000
})

const calculatedWeight = computed<number>(() => {
  return form.weight || 0
})

const dimensionalWeight = computed<number>(() => {
  if (!hasDimensions.value) return 0
  return calculatedCube.value * 10000
})

// Use higher of actual weight or dimensional weight
const effectiveWeight = computed<number>(() => {
  if (hasDimensions.value) {
    return Math.max(calculatedWeight.value, dimensionalWeight.value)
  }
  return calculatedWeight.value
})

// Find price tier based on effective weight
const selectedPriceTier = computed(() => {
  if (effectiveWeight.value <= 0) return null

  return (
    WEIGHT_PRICE_TIERS.find((tier) => effectiveWeight.value >= tier.minKg && effectiveWeight.value < tier.maxKg) ||
    WEIGHT_PRICE_TIERS[WEIGHT_PRICE_TIERS.length - 1]
  )
})

const selectedTierRow = computed<number>(() => {
  if (!selectedPriceTier.value) return 0
  return WEIGHT_PRICE_TIERS.indexOf(selectedPriceTier.value) + 1
})

// Calculate final price in USD
const priceInUSD = computed<number>(() => {
  if (effectiveWeight.value <= 0) return 0

  if (hasDimensions.value && selectedPriceTier.value) {
    return calculatedCube.value * selectedPriceTier.value.price
  }

  // If only weight provided, multiply by price per kg
  return calculatedWeight.value * PRICE_PER_KG
})

// Convert USD price to UZS
const totalCost = computed<number>(() => {
  if (priceInUSD.value <= 0) return 0
  return priceInUSD.value * USD_TO_UZS
})

const dialogVisible = ref<boolean>(false)

const view = () => {
  dialogVisible.value = true
}

const close = () => {
  dialogVisible.value = false
}

const refresh = () =>
  Object.keys(form).forEach((key) => {
    form[key as keyof FormType] = 0
  })

defineExpose({
  view,
  close,
  refresh
})
</script>
<template>
  <DynamicDialog v-model="dialogVisible" :title="t('cargoCalculator')">
    <div class="calculator-content">
      <el-alert :title="t('enterExactNumbers')" type="warning" :closable="false" class="alert-warning" />
      <el-form label-position="top" class="calculator-form">
        <div class="form-item-content">
          <el-form-item class="form-item" :label="t('cargoLength')" prop="trackNumber">
            <el-input-number :controls="false" v-model="form.length" :min="0" :max="100000">
              <template #suffix>
                <el-text class="suffix-text" tag="span">{{ t('sm') }}</el-text>
              </template>
            </el-input-number>
          </el-form-item>
          <el-form-item class="form-item" :label="t('cargoWidth')" prop="weight">
            <el-input-number :controls="false" v-model="form.width" :min="0" :max="100000">
              <template #suffix>
                <el-text class="suffix-text" tag="span">{{ t('sm') }}</el-text>
              </template>
            </el-input-number>
          </el-form-item>
        </div>
        <el-form-item class="form-item" :label="t('cargoHeight')" prop="dimensions">
          <el-input-number :controls="false" v-model="form.height" :min="0" :max="100000">
            <template #suffix>
              <el-text class="suffix-text" tag="span">{{ t('sm') }}</el-text>
            </template>
          </el-input-number>
        </el-form-item>
        <el-form-item class="form-item" :label="t('cargoWeight')">
          <el-input-number :controls="false" v-model="form.weight" :min="0" :max="100000" suffix-icon="sm">
            <template #suffix>
              <el-text class="suffix-text" tag="span">{{ t('kg') }}</el-text>
            </template>
          </el-input-number>
        </el-form-item>
      </el-form>
      <div class="alert-total">
        <el-text tag="h4" class="total-title">{{ t('calculatedAmount') }}</el-text>
        <div class="total-actions">
          <el-text class="text-content">
            <img class="icon" :src="MassIcon" />
            <span class="weight">{{ calculatedWeight }} {{ t('kg') }}</span>
          </el-text>
          <el-text class="text-content">
            <img :src="TrackIcon" />
            <span>{{ formattedNumber(totalCost) }} {{ t('sum') }}</span>
          </el-text>
        </div>
        <!-- <div v-if="totalCost > 0" class="calc-details">
          <template v-if="hasDimensions">
            <div class="calc-row">
              <span>{{ t('cube') }}:</span>
              <span>{{ calculatedCube.toFixed(4) }}</span>
            </div>
            <div class="calc-row">
              <span>{{ t('dimensionalWeight') }}:</span>
              <span>{{ dimensionalWeight.toFixed(2) }} {{ t('kg') }}</span>
            </div>
            <div class="calc-row">
              <span>{{ t('effectiveWeight') }}:</span>
              <span>{{ effectiveWeight.toFixed(2) }} {{ t('kg') }}</span>
            </div>
            <div class="calc-row">
              <span>{{ t('priceTier') }}:</span>
              <span>{{ t('row') }}: {{ selectedTierRow }}</span>
            </div>
          </template>
          <template v-else>
            <div class="calc-row">
              <span>{{ t('pricePerKg') }}:</span>
              <span>${{ PRICE_PER_KG }}/kg</span>
            </div>
          </template>
          <div class="calc-row">
            <span>{{ t('priceUSD') }}:</span>
            <span>${{ priceInUSD }}</span>
          </div>
        </div> -->

        <el-text class="total-number" tag="strong">{{ formattedNumber(totalCost) }} {{ t('sum') }}</el-text>
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

.calculator-content {
  background-color: #fff;
  width: 100%;
  height: 100% !important;
}

.alert-warning {
  width: 100%;
  padding: 12px;
  border-radius: 16px;
  background-color: #d81b511a;

  :deep(span) {
    @include f-style(13px, 400, #111827);
  }
}

.calculator-form {
  margin-top: 1rem;
  width: 100%;
}

:deep(.el-input__inner) {
  text-align: start !important;
}

.form-item-content {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.form-item {
  width: 100%;

  :deep(.el-input__wrapper) {
    width: fit-content;
    height: 48px;
    border-radius: 16px;
    background-color: transparent;
    display: flex !important;
    justify-items: flex-start !important;
    box-shadow: none !important;
    border: 1.5px solid #e5e7eb;
  }

  :deep(.el-input-number) {
    width: 100% !important;
  }

  .suffix-text {
    @include f-style(14px, 500, #111827);
  }
}

.alert-total {
  width: 100%;
  padding: 16px;
  border-radius: 20px;
  background-color: #ff76231a;
  margin-top: 1rem;

  .total-title {
    @include f-style(14px, 600, #111827);
  }

  .total-actions {
    display: flex;
    margin: 12px 0;
    color: #6b7280;
    column-gap: 1rem;

    .text-content {
      display: flex;
      align-items: center;
      gap: 3px;

      img {
        width: 20px;
        height: 20px;
      }

      span {
        @include f-style(13px, 500, #6b7280);
        margin-top: 2px;
      }
    }
  }

  .total-number {
    @include f-style(20px, 700, #111827);
  }
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: none;
  border: 1.5px solid #dcddde;
}

@media screen and (max-width: 770px) {
  .form-item {
    .suffix-text {
      font-weight: 600;
    }
  }
}
</style>
