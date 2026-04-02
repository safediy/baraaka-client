<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'
import personPvzService from '@/api/PersonPvz'
import { LocationStatusEnum } from '@/constants/api'

import DynamicDialog from '@/components/DynamicDialog/DynamicDialog.vue'
import { useGetPersonPvzQuery } from '@/hooks/queries/usePvzQuery'
import { PersonPvzDTO } from 'types/pvz'
import { TabPaneName } from 'element-plus'
import HomeDeliveryTab from './home-delivery-tab/HomeDeliveryTab.vue'
import PickupPointTab from './pickup-point-tab/PickupPointTab.vue'

const { t } = useI18n()

const deleteLocationDialog = ref()
const showAddLocationDialog = ref()
const selectPvz = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const dialogVisible = ref<boolean>(false)

const activeName = ref(LocationStatusEnum.DELIVERY)
const selectPvzData = ref<PersonPvzDTO | null>(null)
const activeTab = ref<LocationStatusEnum>(LocationStatusEnum.DELIVERY)

const telegramService = window.Telegram
telegramService.WebApp.ready()

const queryFilter = computed(() => {
  if (activeName.value === LocationStatusEnum.DELIVERY) {
    return { s: { 'pvz.service': 2 } }
  } else {
    return { s: { 'pvz.service': { $ne: 2 }, 'pvz.isActive': 1 } }
  }
})

const {
  data: personPvzData,
  isLoading: isPersonPvzLoading,
  refetch
} = useGetPersonPvzQuery(queryFilter, {
  enabled: computed(() => dialogVisible.value)
})

const show = async (): Promise<void> => {
  dialogVisible.value = true
  refetch()
}

const handleShowMapDialog = (): void => {
  showAddLocationDialog.value.show()
}

const refresh = (): void => {
  showAddLocationDialog.value = false
  refetch()
}

const handleSelectPersonPvz = async (): Promise<void> => {
  isLoading.value = true
  try {
    await personPvzService.selectPersonPvz(selectPvzData.value as PersonPvzDTO)
    refetch()
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
    dialogVisible.value = false
  }
}

const handleDeleteLocation = (location: PersonPvzDTO): void => {
  deleteLocationDialog.value.show(location)
}
const handleTabChange = (status: TabPaneName): void => {
  const currentStatus = status as LocationStatusEnum
  activeTab.value = currentStatus
  activeName.value = currentStatus
  selectPvz.value = false
  selectPvzData.value = null
}

defineExpose({ show })
</script>

<template>
  <DynamicDialog class="person__location-dialog" v-model="dialogVisible" :title="t('myAddress')" size="100%">
    <el-tabs v-model="activeName" class="tab-buttons w-full!" @tab-change="handleTabChange">
      <el-tab-pane :name="LocationStatusEnum.DELIVERY">
        <template #label>
          <el-text class="tab-label-title text-[14px] font-medium uno-text-main" tag="span">{{
            t('delivery.to.door')
          }}</el-text>
          <el-text class="tab-label-title text-[14px] font-medium uno-text-main tab-label-title-short" tag="span">{{
            t('delivery.to.door.short')
          }}</el-text>
        </template>

        <HomeDeliveryTab
          :personPvzData="personPvzData"
          :isPersonPvzLoading="isPersonPvzLoading"
          :handleShowMapDialog="handleShowMapDialog"
          :onSelectAddress="handleSelectPersonPvz"
          :isLoading="isLoading"
        />
      </el-tab-pane>

      <el-tab-pane :name="LocationStatusEnum.PVZ">
        <template #label>
          <el-text class="tab-label-title" tag="span">{{ t('delivery.to.point') }}</el-text>
          <el-text class="tab-label-title tab-label-title-short" tag="span">{{ t('delivery.to.point.short') }}</el-text>
        </template>

        <PickupPointTab
          :personPvzData="personPvzData"
          :isPersonPvzLoading="isPersonPvzLoading"
          :handleDeleteLocation="handleDeleteLocation"
          :handleShowMapDialog="handleShowMapDialog"
        />
      </el-tab-pane>
    </el-tabs>
  </DynamicDialog>

  <AddLocationDialog ref="showAddLocationDialog" @refresh="refresh" />
  <DeleteLocationDialog @refresh="refresh" ref="deleteLocationDialog" />
  <EditClientPvzDialog ref="editClientPvzDialog" />
</template>

<style lang="scss" scoped>
@mixin f-style($fSize, $fWeight, $color) {
  font-size: $fSize;
  font-weight: $fWeight;
  color: $color;
}

.custom-tabs {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  gap: 15px;
  position: relative;
}

.tab-label-title {
  @include f-style(13px, 600, #111827);
}

.tab-label-title-short {
  display: none;
}

:deep(.el-tabs__nav) {
  width: 100%;
}

:deep(.el-tabs__nav-wrap) {
  margin-bottom: 0;
  width: 100%;

  &::after {
    display: none;
  }
}

:deep(.el-tabs__active-bar) {
  display: none;
}

:deep(.el-tabs__content) {
  overflow: auto;
}

:deep(.el-tabs__nav-scroll) {
  display: flex;
  justify-content: space-between;
  background: #f5f5f5;
  padding: 3px 2px;
  margin: 0;
  width: 100%;
  border-radius: 16px;
}

:deep(.el-tabs__item) {
  border: none;
  background: transparent;
  font-weight: bold;
  color: #777;
  padding: 10px 20px 10px 20px !important;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
  border-radius: 16px;
}

:deep(.el-tabs__item).is-active {
  background-color: #ffffff;
  padding: 0 16px;
  color: #030712;
}

.disabled-btn {
  cursor: not-allowed;
  background-color: #959699 !important;
}

.point-card {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  gap: 20px;
  align-items: flex-start;

  .delete-btn {
    width: 20px;
    height: 20px;
  }
}

.empty-location-wrapper {
  width: 100%;
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;

  img {
    width: 128px;
    height: 128px;
    object-fit: contain;
  }

  .info-text {
    @include f-style(14px, 500, #9ca3af);
    max-width: 240px;
    line-height: 20px;
    text-align: center;
  }

  .create-btn {
    width: 100%;
    height: 48px;
    background-color: #030712;
    @include f-style(15px, 500, #fff);
    border-radius: 16px;
  }
}

.el-drawer {
  max-width: 580px;
  margin: 0 auto;
  /* height: 54% !important; */
  border-radius: var(--Sizes-size-20, 20px) var(--Sizes-size-20, 20px) 0px 0px;
  background: var(--system-white, #fff);

  .warn__text {
    color: var(--main-label, #111827);
    text-align: center;

    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: 120%;
    /* 19.2px */
  }

  // .el-drawer__body {
  //   display: flex;
  //   flex-direction: column;
  //   align-items: center;
  //   gap: 12px;
  // }

  .warn_cy {
    display: flex;
    width: 64px;
    height: 64px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    border-radius: 32px;
    background: var(--main-warning, #ff9500);
    margin: 0 auto;
  }
}

@media only screen and (max-width: 770px) {
  .tab-label-title {
    display: none;
  }

  :deep(.el-tab-pane) {
    height: 75vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  :deep(.el-tabs) {
    height: 100%;
  }

  .edit-icon {
    display: none;
  }

  .media-edit-icon {
    display: block !important;
  }

  .tab-label-title-short {
    display: block;
  }
}
</style>
