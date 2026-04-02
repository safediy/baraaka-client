<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import DataService from '@/api/DataService'
import { ClientStatsType } from 'types/api'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'

import { Bar } from 'vue-chartjs'
import DynamicDialog from '@/components/DynamicDialog/DynamicDialog.vue'
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const { t } = useI18n()
const dialogVisible = ref<boolean>(false)
const loading = ref<boolean>(false)

const clientStatsData = reactive<ClientStatsType>({
  monthsWeight: [],
  totalPayAmount: 0,
  totalWaybillsCount: 0,
  totalWeight: 0
})

const view = () => {
  dialogVisible.value = true
  handleGetCLientStats()
}

const handleGetCLientStats = async () => {
  loading.value = true
  try {
    const response = await DataService.clientStats()
    clientStatsData.monthsWeight = response.monthsWeight
    clientStatsData.totalPayAmount = response.totalPayAmount
    clientStatsData.totalWaybillsCount = response.totalWaybillsCount
    clientStatsData.totalWeight = response?.totalWeight
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const windowWidth = ref(window.innerWidth)

const handleResize = () => {
  windowWidth.value = window.innerWidth
}
const maxWeight = computed(() => {
  if (!clientStatsData.monthsWeight.length) return undefined
  const weights = clientStatsData.monthsWeight.map((m: any) => m.totalWeight || 0)
  return Math.max(...weights)
})

onMounted(() => {
  window.addEventListener('resize', handleResize)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

const dynamicBarThickness = computed(() => {
  if (windowWidth.value <= 480) return 8
  if (windowWidth.value <= 768) return 10
  return 10
})

const chartData = computed(() => ({
  labels: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'],
  datasets: [
    {
      label: t('volume'),
      backgroundColor: 'black',
      borderRadius: 6,

      barThickness: dynamicBarThickness.value,
      data: clientStatsData?.monthsWeight?.map((m: any) => m.totalWeight)
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: {
      ticks: {
        callback: (value: any) => `${value} kg`
      },
      beginAtZero: true,
      max: maxWeight.value
      // grid: {
      //   display: false
      // }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
}

defineExpose({
  view
})
</script>

<template>
  <DynamicDialog :scroll-hide="true" size="100%" v-model="dialogVisible" :title="t('myStats')">
    <div class="dialog-cards-wrapper">
      <div class="rating-card">
        <el-text tag="h5" class="card-title">{{ t('totalParcels') }}</el-text>
        <el-skeleton v-if="loading" :rows="0" variant="p" style="width: 100%; height: 1px" animated />
        <el-text v-else tag="strong" class="card-value">{{ clientStatsData?.totalWeight.toFixed(2) }} kg</el-text>
      </div>
      <div class="rating-card">
        <el-text tag="h5" class="card-title">{{ t('tracks') }}</el-text>
        <el-skeleton v-if="loading" :rows="0" variant="p" style="width: 100%; height: 10px" animated />
        <el-text v-else tag="strong" class="card-value">{{ clientStatsData?.totalWaybillsCount }}</el-text>
      </div>
      <div class="rating-card">
        <el-text tag="h5" class="card-title">{{ t('totalPaid') }}</el-text>
        <el-skeleton v-if="loading" :rows="0" variant="p" style="width: 100%; height: 10px" animated />
        <el-text v-else tag="strong" class="card-value"
          >{{ clientStatsData?.totalPayAmount.toFixed(1) ?? 0 }} $</el-text
        >
      </div>
      <div class="rating-card chart-card">
        <el-text tag="h5" class="card-title">{{ t('volume') }}</el-text>
        <div class="chart-wrapper" v-if="clientStatsData.monthsWeight.length">
          <div />
          <div v-if="loading" style="height: 180px">
            <el-skeleton :rows="4" style="width: 100%; height: 180px" animated />
          </div>
          <Bar class="bar" v-else :data="chartData" :options="chartOptions" />
        </div>
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

.custom-dialog {
  overflow: visible !important;
}

:deep(.el-overlay-dialog) {
  overflow: hidden !important;
}

.chart-wrapper {
  margin-top: 20px;
  width: 100%;
  height: 256px;
  position: relative;

  .bar {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  canvas {
    width: 100% !important;
    height: 200px !important;
  }
}

.dialog-cards-wrapper {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: auto auto auto;
  gap: 8px;
  margin-top: 16px;
}

.rating-card {
  background-color: #f3f4f6;
  width: 100%;
  border-radius: 20px;
  padding: 16px;
  height: 140px;
  gap: 60px;
  display: grid;

  .card-title {
    @include f-style(14px, 500, #111827);
  }

  .card-value {
    @include f-style(18px, 700, #111827);
  }

  &:first-child {
    grid-column: 1;
    grid-row: 1;
  }

  &:nth-child(2) {
    grid-column: 2;
    grid-row: 1;
  }

  &:nth-child(3) {
    grid-column: 1/3;
    grid-row: 2;
  }

  &:last-child {
    grid-column: 1/3;
    grid-row: 3;
  }
}

.chart-card {
  gap: 0 !important;
  height: 256px !important;
}

@media only screen and (max-width: 770px) {
  .rating-card {
    background-color: #fff;
    border: 1px solid #e5e7eb;

    .card-value {
      @include f-style(17px, 700, #111827);
    }
  }
}
</style>
