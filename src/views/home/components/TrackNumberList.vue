<script lang="ts" setup>
import { Nullable } from 'vitest'
import { useI18n } from 'vue-i18n'
import { debounce } from 'lodash-es'
import { formattedNumber } from '@/utils'
import MassIcon from '@/assets/svg/mass.svg'
import EmptyBox from '@/assets/empty-box.png'
import TrackIcon from '@/assets/svg/track.svg'
import DollarIcon from '@/assets/svg/dollar.svg'
import WaybillService from '@/api/WaybillService'
import PaidDollarIcon from '@/assets/svg/paidDollar.svg'
import { DeliveryStatusEnum, PayStatusEnum, TrackingStatusArray } from '@/constants/api'
import TrackNumberViewDialog from './TrackNumberViewDialog.vue'
import { TrackingListParam, TrackingSearchParam, TrackingStatusesType } from 'types/params'
import { computed, onMounted, PropType, reactive, ref, watch } from 'vue'
// import AddTrackNumberDialog from '@/layouts/components/Navbar/AddTrackNumberDialog.vue'
import WaybillPaymentDialog from './waybillPaymentDialog.vue'
import PaymentService from '@/api/PaymentService'

type PayStatusType = PayStatusEnum.PAID | PayStatusEnum.UN_PAID

interface PaymentDataType {
  clientId: number | undefined
  trackingNumbers: string[]
  amount: number
}

const { t } = useI18n()

const props = defineProps({
  search: {
    type: Object as PropType<TrackingSearchParam>,
    default: () => ({})
  },
  queryTrackingNumbers: {
    type: Array as PropType<Array<string>>,
    default: () => []
  }
})

const localSearch = reactive<any>({
  trackingNumber: { $cont: '' }
})

const loading = ref(false)
const isLoading = ref(false)
const paymentErrorDialog = ref()
// const addTrackNumberDialog = ref()
const waybillPaymentDialog = ref()
const trackNumberViewDialog = ref()
const activeStatus = ref<TrackingStatusesType>(TrackingStatusArray()[0].key)
const selectedTrackNumberData = ref<WaybillInfoDTO[]>([])
const activeTab = ref<PayStatusType>(PayStatusEnum.UN_PAID)
const trackNumberData = ref<Nullable<Record<PayStatusType, WaybillInfoDTO[]>>>({
  [PayStatusEnum.PAID]: [],
  [PayStatusEnum.UN_PAID]: []
})

const getTrackingData = WaybillService.getTrackingData()
const getTrackingBySearchData = WaybillService.getTrackingBySearchData()

import { useUserStore } from '@/store/modules/user'
// import { ElMessage } from 'element-plus'
import { sortUnpaidFirst } from '@/utils/helpers'
import PaymentErrorDialog from '@/views/orders/PaymentErrorDialog.vue'
import { CheckboxValueType, ElMessage } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'
import { WaybillInfoDTO } from 'types/waybill'

const userStore = useUserStore()

const handleViewDialog = (waybill: WaybillInfoDTO) => {
  trackNumberViewDialog.value?.view(waybill)
}

// const handleAddDialog = () => {
//   addTrackNumberDialog.value?.show()
// }

const handleStatusChange = async (tab: string, value: any) => {
  loading.value = true
  activeStatus.value = tab
  const response = await (props.search?.trackingNumber?.$cont ? getTrackingBySearchData(value) : getTrackingData(value))
  trackNumberData.value![activeTab.value] = response
  loading.value = false
}

const handleSelectAll = (selectAll: CheckboxValueType) => {
  const currentData = trackNumberData.value![activeTab.value].filter(
    (item) => item.payStatus !== PayStatusEnum.UN_BILLED && item.payAmount !== null && item.canPayment !== false
  )

  if (selectAll) {
    currentData.forEach((item) => {
      if (!selectedTrackNumberData.value.some((selected) => selected.id === item.id)) {
        selectedTrackNumberData.value.push(item)
      }
    })
  } else {
    selectedTrackNumberData.value = selectedTrackNumberData.value.filter(
      (item) => !currentData.some((i) => i.id === item.id)
    )
  }
}

const handleSelectTrackNumber = (item: WaybillInfoDTO) => {
  if (!item.canPayment) {
    return
  }
  const index = selectedTrackNumberData.value.findIndex((i) => i.id === item.id)
  const { Toshkent, ReProcessing } = DeliveryStatusEnum

  if (index !== -1) {
    // If item exists in selected list, remove it
    selectedTrackNumberData.value.splice(index, 1)

    // If the clicked item has the specific status, remove all items with the same status
    if (item.status === Toshkent || item.status === ReProcessing) {
      selectedTrackNumberData.value = selectedTrackNumberData.value.filter(
        (dataItem) =>
          dataItem.status !== Toshkent &&
          dataItem.status !== ReProcessing &&
          dataItem.payAmount !== null &&
          dataItem.canPayment !== false
      )
    }
  } else {
    // If item doesn't exist in the selected list, add it
    if (item.status === Toshkent || item.status === ReProcessing) {
      const itemsWithSameStatus =
        trackNumberData.value?.[activeTab.value]?.filter(
          (dataItem) =>
            dataItem.status === Toshkent || (dataItem.status === ReProcessing && dataItem.canPayment !== false)
        ) || []

      const newItems = itemsWithSameStatus.filter(
        (dataItem) => !selectedTrackNumberData.value.some((selected) => selected.id === dataItem.id)
      )
      selectedTrackNumberData.value = [...selectedTrackNumberData.value, ...newItems]
    } else {
      selectedTrackNumberData.value.push(item)
    }
  }
}

const isAllSelected = computed(() => {
  const currentData =
    trackNumberData.value?.[activeTab.value]?.filter(
      (item) => item.payStatus !== PayStatusEnum.UN_BILLED && item.payAmount !== null && item.canPayment !== false
    ) || []

  const selectedIds = new Set(selectedTrackNumberData.value.map((i) => i.id))

  return currentData.length > 0 && currentData.every((item) => selectedIds.has(item.id))
})

// Pure computed property for calculating total values
const totalValues = computed(() => {
  return selectedTrackNumberData.value.reduce(
    (acc, item) => {
      acc.weight += item.weight ?? 0
      acc.payAmountSom += item.payAmountSom ?? 0
      return acc
    },
    { weight: 0, payAmountSom: 0 }
  )
})

const isSelected = (item: WaybillInfoDTO) => {
  return selectedTrackNumberData.value.some((i) => i.id === item.id)
}

const searchData = reactive<TrackingListParam>({
  payStatus: null
})

const getData = async () => {
  loading.value = true
  try {
    searchData.payStatus =
      activeTab.value === PayStatusEnum.UN_PAID ? { $in: ['UN_PAID', 'UN_BILLED'] } : PayStatusEnum.PAID
    const response = await getTrackingData(searchData)

    trackNumberData.value![activeTab.value] = sortUnpaidFirst(response)
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = debounce(async () => {
  if (!props.search?.trackingNumber?.$cont) {
    getData()
    return
  }
  try {
    const response = await getTrackingBySearchData(props.search)
    if (!response.length) {
      trackNumberData.value = {
        [PayStatusEnum.PAID]: [],
        [PayStatusEnum.UN_PAID]: []
      }
      return
    }
    trackNumberData.value = response.reduce(
      (prev, cur) => {
        const key = cur.payStatus === PayStatusEnum.UN_BILLED ? PayStatusEnum.UN_PAID : cur.payStatus
        ;(prev[key] ??= []).push(cur)
        cur.payStatus === PayStatusEnum.UN_PAID // use this
        return prev
      },
      {} as Record<PayStatusType, WaybillInfoDTO[]>
    )
  } catch (error) {
    console.error('Search error:', error)
  }
}, 300)

const handleTabChange = (status: PayStatusType) => {
  activeTab.value = status
  if (localSearch.trackingNumber.$cont) {
    return
  }
  getData()
}

const handlePayment = async () => {
  isLoading.value = true
  try {
    const paymentData = <PaymentDataType>{
      clientId: userStore.clientCode,
      trackingNumbers: selectedTrackNumberData.value.map((item) => item.trackingNumber),
      amount: totalValues.value.payAmountSom * 100
    }
    const response = await PaymentService.Payment(paymentData)
    if (response.statusCode === 200) {
      waybillPaymentDialog.value.view(response.payments)
    }
  } catch (error) {
    paymentErrorDialog.value.view(error)
    console.log(error)
  } finally {
    isLoading.value = false
  }
}

const updateSelectedTrackNumbers = debounce(() => {
  const activeTabData = trackNumberData.value?.[activeTab.value] || []

  const newSelectedItems = props.queryTrackingNumbers
    .map((queryNumber) => activeTabData.find((item) => item.trackingNumber === queryNumber))
    .filter((element): element is (typeof activeTabData)[0] => element !== undefined)
  selectedTrackNumberData.value = newSelectedItems
}, 300)

const shouldShowCheckbox = computed(() => {
  const status = activeStatus.value

  const isStatusValid =
    typeof status === 'string' &&
    ![DeliveryStatusEnum.CREATED, DeliveryStatusEnum.Delivered, DeliveryStatusEnum.UN_LAWFUL].includes(
      status as DeliveryStatusEnum
    )
  return activeTab.value === PayStatusEnum.UN_PAID && isStatusValid
})

watch(
  [() => props.queryTrackingNumbers, () => trackNumberData.value, () => activeTab.value],
  updateSelectedTrackNumbers,
  { immediate: true }
)
watch(
  () => localSearch?.trackingNumber?.$cont,
  () => {
    handleSearch()
  }
)

watch(
  () => props.search,
  (newVal) => {
    Object.assign(localSearch, newVal)
  },
  { immediate: true }
)

onMounted(() => {
  getData()
})

const statusColor = computed(() => {
  return (status: DeliveryStatusEnum) => {
    switch (status) {
      case DeliveryStatusEnum.UN_LAWFUL:
        return 'danger'
      case DeliveryStatusEnum.Delivered:
        return 'success'
      default:
        return 'primary'
    }
  }
})

const copyTrackingNumber = async (trackingNumber: string) => {
  try {
    await navigator.clipboard.writeText(trackingNumber)
    ElMessage({
      message: `${trackingNumber} ${t('message.copiedTrackingNumber')}`,
      type: 'success',
      duration: 1500
    })
  } catch (err) {
    ElMessage({
      message: t('message.error'),
      type: 'error',
      duration: 1500
    })
  }
}

const reloadOrders = async () => {
  await getData()
}

defineExpose({
  reloadOrders
})
</script>

<template>
  <div class="tracking-number-list">
    <div class="custom-tabs content-container">
      <!-- Tabs -->
      <el-button-group class="tab-buttons">
        <el-button
          :class="{ active: activeTab == PayStatusEnum.UN_PAID }"
          @click="handleTabChange(PayStatusEnum.UN_PAID)"
        >
          {{ t('payStatus.UN_PAID') }}
          <span class="tabBadge" v-if="trackNumberData?.UN_PAID?.length && localSearch?.trackingNumber?.$cont">{{
            trackNumberData?.UN_PAID.length
          }}</span>
        </el-button>
        <el-button :class="{ active: activeTab == PayStatusEnum.PAID }" @click="handleTabChange(PayStatusEnum.PAID)">
          {{ t('payStatus.PAID') }}
          <span class="tabBadge" v-if="trackNumberData?.PAID?.length && localSearch?.trackingNumber?.$cont">{{
            trackNumberData?.PAID?.length
          }}</span>
        </el-button>
      </el-button-group>
      <!-- Content -->
      <div class="content__status-header">
        <div class="all-status">
          <span
            v-for="(item, ind) in TrackingStatusArray({
              CREATED: activeTab === PayStatusEnum.PAID,
              Delivered: activeTab !== PayStatusEnum.PAID,
              DropZone: activeTab !== PayStatusEnum.PAID
            })"
            :key="ind"
            class="status-btn"
            :class="{ 'selected-status-btn': activeStatus === item.key }"
            @click="handleStatusChange(item.key, item.value)"
          >
            {{ t('tracking.status.' + item.key) }}
          </span>
        </div>
      </div>
      <el-checkbox
        @click.stop
        :checked="isAllSelected"
        @change="handleSelectAll($event)"
        v-if="shouldShowCheckbox"
        class="checkbox"
        :label="t('selectAll')"
      />
      <div
        :class="[
          'tab-content',
          {
            isCheckbox: shouldShowCheckbox
          },
          { isPaid: activeTab === PayStatusEnum.PAID }
        ]"
      >
        <template v-if="loading">
          <div v-for="index in 5" :key="index" class="paid__card-item-skeleton">
            <el-skeleton animated :loading="true" class="item-skeleton">
              <template #template>
                <div class="skeleton-checkbox" />
                <div class="skeleton-content">
                  <el-skeleton-item variant="text" class="content-title" />
                  <div class="skeleton-subinfo">
                    <el-skeleton-item class="subinfo-text" variant="text" />
                    <el-skeleton-item class="subinfo-text" variant="text" />
                  </div>
                  <el-skeleton-item class="status-skeleton" variant="text" />
                </div>
                <div class="skeleton-right-icon" />
              </template>
            </el-skeleton>
          </div>
        </template>

        <template v-else>
          <div class="paid__card-wrapper" v-if="trackNumberData![activeTab]?.length">
            <div
              v-for="item in sortUnpaidFirst(trackNumberData![activeTab])"
              :key="item.id"
              @click="handleViewDialog(item)"
              class="paid__card-item"
            >
              <el-checkbox
                :model-value="isSelected(item)"
                @change="handleSelectTrackNumber(item)"
                @click.stop
                v-if="
                  activeTab === PayStatusEnum.UN_PAID &&
                  item.payStatus !== PayStatusEnum.UN_BILLED &&
                  item.payAmount !== 0 &&
                  item.payAmount !== null &&
                  item.canPayment !== false
                "
                class="checkbox"
              />
              <img
                :src="activeTab === PayStatusEnum.UN_PAID ? DollarIcon : PaidDollarIcon"
                alt=""
                style="width: 40px; height: 40px"
              />
              <div class="item-contents">
                <div class="flex items-center gap-3">
                  <el-text class="track-number" tag="h5">{{ item.trackingNumber }}</el-text>

                  <!-- Copy Icon -->
                  <el-icon
                    class="cursor-pointer text-[17px]! !font-semibold! hover:text-blue-500 transition"
                    @click.stop.prevent="copyTrackingNumber(item.trackingNumber)"
                  >
                    <CopyDocument />
                  </el-icon>
                </div>
                <div class="track-actions">
                  <el-text class="text-content">
                    <img class="icon" :src="MassIcon" />
                    <span class="weight">{{ item.weight || '0' }} {{ t('kg') }}</span>
                  </el-text>
                  <el-text class="text-content">
                    <img :src="TrackIcon" />
                    <span>{{ formattedNumber(item.payAmountSom) || '0' }} {{ t('sum') }}</span>
                  </el-text>
                </div>
                <el-tag class="status-text" tag="p" :type="statusColor(item.status)">{{
                  t('status.' + item?.status)
                }}</el-tag>
              </div>
              <el-icon class="right-icon">
                <ArrowRight />
              </el-icon>
            </div>
          </div>

          <div v-else class="empty-box-content">
            <img :src="EmptyBox" alt="No Data" />
            <p class="content-info">
              {{ t('order.not.found') }}
            </p>
            <!-- <el-button v-if="activeStatus === 'ALL'" @click="handleAddDialog" class="add-btn">{{
              t('addTrackNumber')
            }}</el-button> -->
          </div>
        </template>
      </div>
    </div>
    <div :class="['content-container', 'payment-action']" v-if="activeTab === PayStatusEnum.UN_PAID">
      <el-button :disabled="!selectedTrackNumberData.length" @click="handlePayment" class="pay-btn">
        <div>{{ t('payment') }}</div>
        <div class="amountBox">
          <div class="amount">{{ totalValues.weight.toFixed(2) }} {{ t('kg') }}</div>
          <div class="amount">{{ formattedNumber(totalValues.payAmountSom) }} {{ t('sum') }}</div>
        </div>
      </el-button>
    </div>
    <TrackNumberViewDialog ref="trackNumberViewDialog" />
    <WaybillPaymentDialog :paidData="selectedTrackNumberData" ref="waybillPaymentDialog" />
    <!-- <AddTrackNumberDialog ref="addTrackNumberDialog" /> -->
    <PaymentErrorDialog ref="paymentErrorDialog" />
  </div>
</template>

<style lang="scss" scoped>
@mixin f-style($fSize, $fWeight, $color) {
  font-size: $fSize;
  font-weight: $fWeight;
  color: $color;
}

.content__status-header {
  display: flex;
  width: 100%;
  gap: 15px;
  overflow-y: hidden;
  position: relative;

  &::after {
    content: '';
    width: 3px;
    height: 32px;
    top: 0;
    right: 0;
    box-shadow: -10px 9px 10px 18px #ffffff;
    -webkit-box-shadow: -10px 9px 10px 18px #ffffff;
    -moz-box-shadow: -10px 9px 10px 18px #ffffff;
  }
}

.all-status {
  display: flex;
  width: 100%;
  overflow-x: auto;
  padding-right: 16px;
  gap: 2px;

  &::-webkit-scrollbar {
    appearance: none;
    height: 1px !important;
  }

  span {
    text-wrap: nowrap;
  }

  .status-btn {
    @include f-style(14px, 600, #111827);
    background-color: #f3f4f6;
    border-radius: 36px;
    padding: 7.5px 12px;
    outline: none;
    border: none;
    cursor: pointer;
  }

  .selected-status-btn {
    background-color: #111827;
    color: #fff !important;
  }
}

.payment-action {
  background-color: #fff;
  position: relative;
  width: 100%;
  bottom: 0;
  z-index: 10;

  .pay-btn {
    outline: none;
    border: none;
    background-color: #030712;
    @include f-style(14px, 600, #fff);
    // border-radius: 32px;
    width: 100%;
    height: 48px;

    &:disabled {
      pointer-events: none;
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  :deep(.el-button span) {
    display: flex !important;
    flex-direction: column !important;
    align-items: center;
    justify-content: center;
    gap: 2px;
  }

  :deep(.el-button span) {
    display: flex !important;
    flex-direction: column !important;
    align-items: center;
    justify-content: center;
    gap: 2px;
  }

  .amountBox {
    @include f-style(12px, 600, #9ca3af);
    display: flex;
    gap: 12px;

    .amount:nth-child(1) {
      position: relative;

      &::after {
        position: absolute;
        right: -8px;
        top: 5px;
        transform: translateX(8%);
        width: 4px;
        height: 4px;
        content: '';
        background-color: #9ca3af;
        border-radius: 50%;
      }
    }
  }
}

.tracking-number-list {
  height: 100%;
}

.paid__card-wrapper {
  display: flex;
  flex-direction: column;
}

.paid__card-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  width: 100%;
  text-align: left;
  position: relative;
  cursor: pointer;
  transition: 0.3s;
  border-radius: 12px;
  padding-top: 16px;

  .right-icon {
    font-size: 18px !important;
  }

  @media screen and (min-width: 770px) {
    &:hover {
      background-color: #f3f4f6;

      .right-icon {
        right: 2%;
      }
    }
  }
}

.paid__card-item-skeleton {
  display: flex !important;
  align-items: center;
  gap: 16px;
  width: 100%;
  text-align: left;
  position: relative;
  cursor: pointer;
  transition: 0.3s;
  border-radius: 12px;
  padding-top: 16px;
}

.item-skeleton {
  display: flex;
  position: relative;

  .skeleton-checkbox {
    width: 20px;
    height: 20px;
    background-color: #e5e7eb;
    border-radius: 50%;
  }

  .skeleton-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 30% !important;
    padding: 0 20px;
    max-width: 100%;
    flex-grow: 1;

    .content-title {
      width: 50%;
      height: 12px;
      background-color: #e5e7eb;
      border-radius: 4px;
    }

    .skeleton-subinfo {
      display: flex;
      gap: 8px;
      width: 60%;

      .subinfo-text {
        width: 100%;
        height: 12px;
        background-color: #e5e7eb;
        border-radius: 4px;
      }
    }

    .status-skeleton {
      width: 50%;
      height: 12px;
      background-color: #e5e7eb;
      border-radius: 4px;
    }
  }

  .skeleton-right-icon {
    width: 10px;
    height: 5px;
    background-color: #e5e7eb;
    border-radius: 2px;
    position: absolute;
    right: 3%;
    top: 30%;
  }

  @media screen and (max-width: 770px) {
    .skeleton-content {
      .content-title {
        width: 70%;
      }

      .skeleton-subinfo {
        width: 80%;
      }

      .status-skeleton {
        width: 70%;
      }
    }
  }
}

.checkbox {
  align-self: start;
}

.checkbox :deep(.el-checkbox__inner) {
  border-radius: 6px;
  border: 1.5px solid #e5e7eb;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.checkbox :deep(.el-checkbox__inner::after) {
  border-color: white;
  position: absolute;
  border-width: 2px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
}

.checkbox :deep(.el-checkbox__label) {
  @include f-style(14px, 600, #111827);
  padding-left: 16px;
}

.checkbox :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background: #0a0a0a;
  border: 1.5px solid #0a0a0a;

  /* Tanlangan holatda ham qora fon */
}

.right-icon {
  position: absolute;
  transition: 0.3s;
  right: 3%;
  top: 40%;
  color: #9ca3af;
}

.item-contents {
  border-bottom: 1px solid #f3f4f6;
  width: 65%;
  padding-bottom: 16px;

  .track-number {
    @include f-style(15px, 600, #111827);
  }
}

.item-status-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.track-actions {
  display: flex;
  margin: 6px 0;
  color: #6b7280;
  column-gap: 1rem;

  .text-content {
    display: flex;
    align-items: center;
    gap: 4px;

    img {
      width: 20px;
      height: 20px;
    }

    span {
      @include f-style(14px, 600, #6b7280);
      margin-top: 2px;
    }
  }
}

.status-text {
  font-size: 13px;
  font-weight: 500;
  border-radius: 32px;
  padding: 4px 8px;

  &.el-tag--primary {
    background-color: #007aff1a;
    color: #007aff;
  }
}

.custom-tabs {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
  gap: 15px;
  /* width: 100%; */
  position: relative;
}

.tab-buttons {
  display: flex;
  background: #f3f4f6;
  justify-content: space-between;
  width: 100%;
  border-radius: 16px;
  height: 40px;
  padding: 2px;
}

.tab-buttons .el-button {
  border: none;
  background: transparent;
  font-weight: bold;
  color: #777;
  border-radius: 16px !important;
  width: 50%;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 20px;
  height: 100%;
  font-size: 14px;

  .tabBadge {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    border-radius: 50%;
    justify-content: center;
    background-color: #030712;
    color: white;
    margin-left: 10px;
    font-size: 12px;
  }
}

.tab-buttons .el-button.active {
  background: white;
  color: black;
  box-shadow: 0px 3px 8px 0px #1118270d;
}

.tab-content {
  text-align: center;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;

  height: calc(100vh - 332px);

  @media screen and (max-width: 770px) {
    height: calc(100vh - 312px);
  }

  &.isPaid {
    height: calc(100vh - 268px);

    @media screen and (max-width: 770px) {
      height: calc(100vh - 248px);
    }
  }

  &.isCheckbox {
    height: calc(100vh - 379px);

    @media screen and (max-width: 770px) {
      height: calc(100vh - 359px);
    }
  }

  &::-webkit-scrollbar {
    width: 4px;
    height: 4px;
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

.empty-box-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  // height: 400px !important;
  padding-top: 50px;
  height: 100% !important;

  img {
    width: 134px;
    height: 130px;
    object-fit: contain;
  }

  .content-info {
    line-height: 20px;
    text-align: center;
    max-width: 240px;
    @include f-style(14px, 500, #9ca3af);
  }

  .add-btn {
    background: #030712;
    border-radius: 16px;
    max-width: 240px;
    width: 100%;
    height: 48px;
    @include f-style(15px, 500, #ffffff);
  }
}

@media only screen and (max-width: 770px) {
  .track-number {
    font-size: 14px !important;
  }

  .tab-buttons .el-button {
    font-size: 13px !important;
  }

  .text-content {
    span {
      font-size: 13px !important;
    }
  }

  .status-text {
    font-size: 12px !important;
    font-weight: 600 !important;
  }
}
</style>
