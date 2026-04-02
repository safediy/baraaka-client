<script setup lang="ts">
import CashbackService from '@/api/CashbackService'
import { formatDateTime, formattedPhoneNumber } from '@/utils'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

type ReferredClientType = {
  clientId: number
  clientCode: string
  clientName: string
  clientPhone: string
  totalWeight: number
  firstWaybillCreatedAt: string
}

const clientPromoCode = ref<string>('')
const dialogVisible = ref<boolean>(false)
const viewReferredClient = ref<ReferredClientType[]>([])
const loading = ref<boolean>(false)

const view = async ({ promoCode }: { promoCode: string }) => {
  dialogVisible.value = true
  clientPromoCode.value = promoCode
  loading.value = true
  try {
    const response = (await CashbackService.viewCashback(promoCode)) as ReferredClientType[]
    viewReferredClient.value = response
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const close = () => {
  dialogVisible.value = false
}

defineExpose({
  view,
  close
})
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="t('total.invited')"
    style="max-width: 1040px; width: 100%; padding: 0 16px 16px; border-radius: 12px"
  >
    <!-- Skeleton loading -->
    <el-skeleton :loading="loading" animated :rows="4">
      <template #template>
        <div class="flex flex-col gap-4 p-4">
          <el-skeleton-item variant="text" style="width: 100%; height: 30px" />
          <el-skeleton-item variant="text" style="width: 100%; height: 30px" />
          <el-skeleton-item variant="text" style="width: 100%; height: 30px" />
          <el-skeleton-item variant="text" style="width: 100%; height: 30px" />
        </div>
      </template>

      <template #default>
        <el-table :data="viewReferredClient" border style="width: 100%">
          <el-table-column label="No" align="center" width="60">
            <template v-slot="scope">
              <el-text>{{ scope.$index + 1 }}</el-text>
            </template>
          </el-table-column>

          <el-table-column prop="clientName" :label="t('fullname')" align="center">
            <template v-slot="{ row }">
              <el-text type="primary">{{ row.clientName }}</el-text>
            </template>
          </el-table-column>
          <el-table-column prop="clientCode" :label="t('clientCode')" align="center">
            <template v-slot="{ row }">
              <el-text type="primary">{{ row.clientCode }}</el-text>
            </template>
          </el-table-column>
          <el-table-column prop="promoCode" :label="t('promocode')" align="center">
            <template #default>
              <el-text>{{ clientPromoCode }}</el-text>
            </template>
          </el-table-column>
          <el-table-column prop="totalWeight" :label="t('weight')" align="center">
            <template v-slot="{ row }">
              <el-text>{{ row.totalWeight }} {{ t('unit.kg') }}</el-text>
            </template>
          </el-table-column>
          <el-table-column prop="firstWaybillCreatedAt" :label="t('arrivalDate')" align="center">
            <template v-slot="{ row }">
              <el-text>{{ formatDateTime(row.firstWaybillCreatedAt) }}</el-text>
            </template>
          </el-table-column>
          <!-- <el-table-column prop="clientPhone" :label="t('phoneNumber')" align="center">
            <template v-slot="{ row }">
              <el-text>{{ formattedPhoneNumber(row.clientPhone) }}</el-text>
            </template>
          </el-table-column> -->
        </el-table>
      </template>
    </el-skeleton>
  </el-dialog>
</template>

<style lang="scss" scoped>
:deep(.el-text) {
  color: #111827;
}

:deep(.el-dialog__title) {
  padding-left: 16px !important;
}
</style>
