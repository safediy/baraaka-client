<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { CheckboxValueType, ElMessage, FormInstance } from 'element-plus'
import mergedWaybillService from '@/api/MergeWaybill'

import { useI18n } from 'vue-i18n'
import { setLocalStorage, setTokenLocal } from '@/utils/cache/cookies'
import constant from '@/utils/constant'

defineOptions({
  name: 'MergeWaybill'
})
// const waybillsa = [
//   {
//     id: 50,
//     status: 'Osh',
//     trackingNumber: "YT20349802839"
//   },
//   {
//     id: 50,
//     status: 'Osh',
//     trackingNumber: "YT20309234590"
//   },
//   {
//     id: 51,
//     status: 'Yiwu',
//     trackingNumber: "YT20435534646"
//   },
//   {
//     id: 52,
//     status: 'Toshkent',
//     trackingNumber: "YT20323423423"
//   },
//   {
//     id: 53,
//     status: 'Ulugchat',
//     trackingNumber: "YT20234243839"
//   }
// ]

// console.log('====================================');
// console.log(btoa(JSON.stringify(waybillsa)));
// console.log('====================================');

const route = useRoute()

const token: any = route.query.tokenKey
const waybills: any = JSON.parse(atob(route.query.waybill as any))
const message: any = route.query.message

if (token) {
  setTokenLocal(token as string)
  setLocalStorage('bot-message', message)
}

const { t } = useI18n()
const loading = ref(false)

const waybillStatus: any = constant.WAYBILL_STATUS_DESCRIPTION

const telegramService = window.Telegram

telegramService.WebApp.ready()
telegramService.WebApp.expand()

const formData: any = reactive({
  allSelected: false
})

const formDataRef = ref<FormInstance>()

const handleSubmit = async () => {
  if (formDataRef.value) {
    delete formData.allSelected
    const trackIds = Object.keys(formData).map(Number)

    if (!trackIds.length) return ElMessage.warning(t('Iltimos oldin trek raqam tanlang!'))

    formDataRef.value.validate(async (valid: any) => {
      if (!valid) return
      loading.value = true
      await mergedWaybillService
        .mergeWaybill({ trackIds })
        .then(() => {
          ElMessage.success(t("Muvaffaqiyatli qo'shildi"))
        })
        .finally(() => {
          loading.value = false
          telegramService.WebApp.close()
        })
    })
  }
}

const rules = {
  trackwdeIds: [{ required: true, message: t('Iltimos trek raqam tanlang'), trigger: 'blur' }]
}

const handleSelect = (waybill: any) => {
  if (formData[waybill.id]) {
    delete formData[waybill.id]
  } else {
    formData[waybill.id] = true
  }

  if (waybills.length == Object.keys(formData).length - 1) {
    formData.allSelected = true
  } else {
    formData.allSelected = false
  }
}

const handleSelectAll = (isChecked: CheckboxValueType) => {
  waybills.forEach((waybill: { id: string }) => {
    isChecked ? (formData[waybill.id] = true) : delete formData[waybill.id]
  })
}
</script>

<template>
  <template class="container">
    <h2>Iltimos birlashtirish uchun trek raqamni tanlang!</h2>
    <el-form
      ref="formDataRef"
      class="form-container"
      :model="formData"
      :rules="rules"
      label-position="top"
      @keydown.enter="handleSubmit"
    >
      <el-form-item prop="trackIds">
        <el-checkbox v-model="formData.allSelected" label="Hammasini tanlash" size="large" @change="handleSelectAll" />
        <el-scrollbar height="45vh" class="btn-container">
          <!-- <BSelect clearable type="district" v-model="formData.districtId" :filterable="false"
          :placeholder="$t('Tumanni tanlang')" /> -->
          <button
            type="button"
            class="select-btn"
            @click="handleSelect(waybill)"
            v-for="waybill in waybills"
            :key="waybill.id"
          >
            <el-checkbox size="large" v-model="formData[waybill.id]" @change="handleSelect(waybill)" />
            <div class="info">
              <h3>{{ waybill.trackingNumber }}</h3>
              <p>{{ waybillStatus[waybill.status] }}</p>
            </div>
          </button>
        </el-scrollbar>
      </el-form-item>
      <el-alert
        title="Diqqat! Birlashtirilgan trek raqamlar bir vaqtning o'zida yetkaziladi va to'lov birgalikda amalga oshiriladi."
        type="warning"
        class="w-alert"
        :closable="false"
        show-icon
      />

      <el-button class="submit-btn" type="primary" :loading="loading" @click="handleSubmit">{{
        $t('Birlashtirish')
      }}</el-button>
    </el-form>
  </template>
</template>

<style lang="scss">
.container {
  background-color: #fff;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  width: auto;
  height: 100vh;
  max-width: 600px;
  margin: 0 auto;

  h2 {
    color: var(--main-label, #111827);

    /* subheadline/semibold */
    font-size: 15px;
    font-style: normal;
    font-weight: 600;
    line-height: 120%;
    /* 18px */
  }

  .form-container {
    flex: 1;
    /* Makes the form take all remaining space */
    display: flex;
    flex-direction: column;
    gap: 6px;

    .el-checkbox.el-checkbox--large .el-checkbox__inner {
      height: 18px;
      width: 18px;
      border-radius: 6px;
    }

    .el-checkbox__input.is-checked .el-checkbox__inner {
      background-color: var(--main-secondary, #044ca2);
      border-color: var(--main-secondary, #044ca2);
    }

    .el-checkbox__inner:after {
      height: 8px;
      top: 2px;
      left: 6px;
    }

    .el-checkbox__input.is-checked + .el-checkbox__label {
      color: #044ca2 !important;
    }

    .el-checkbox__label {
      font-size: 13px;
      font-style: normal;
      font-weight: 600;
      /* line-height: 10%; */
    }

    .btn-container {
      width: 100%;
      margin-top: 10px;

      .el-scrollbar__view {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
    }

    .select-btn {
      display: flex;
      justify-content: start;
      align-items: center;
      width: 100%;
      padding: 8px;
      gap: 16px;
      padding-left: 24px;

      border-radius: 16px;
      /* border: 1px solid #8E3A92; */

      background: var(--system-white, #fbfbfb);

      /* main-card-shadow */
      box-shadow: 0px 3px 8px 0px rgba(17, 24, 39, 0.05);

      font-size: 14px;
      font-style: normal;
      font-weight: 600;
      line-height: 10%;
      box-shadow: none;
      outline: none;
      border: none;
      margin-top: auto;

      .info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        margin-top: 3px;
        gap: 3px;

        h3 {
          color: var(--main-label, #111827);
          /* subheadline/semibold */
          font-size: 12px;
          font-style: normal;
          font-weight: 600;
          line-height: 120%;
          margin: 0;
          /* 18px */
        }

        p {
          color: var(--main-label-secondary, #9ca3af);
          /* footnote/medium */
          font-size: 12px;
          font-style: normal;
          font-weight: 500;
          line-height: 120%;
          margin: 0;
          /* 15.6px */
        }
      }
    }
  }

  .submit-btn {
    display: flex;
    justify-content: center;
    width: 100%;
    padding: 24px;
    border-radius: 32px;
    background: var(--main-secondary, #111827);
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: 10%;
    color: #ffffff;
    left: 0;
    box-shadow: none;
    outline: none;
    border: none;
    margin-top: auto;
  }

  .el-input__wrapper,
  .el-select__wrapper {
    height: 48px;
    width: 100%;
    border-radius: 32px;
    border-radius: 32px;
    background: var(--gray-100, #f3f4f6);
    border: none;
    box-shadow: none !important;
    /* subheadline1/semibold */
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 120%;
    /* 16.8px */

    .el-select__selection,
    input::placeholder {
      color: var(--main-label-secondary, #9ca3af);
      /* subheadline1/semibold */
      font-size: 14px;
      font-style: normal;
      font-weight: 500;
      line-height: 120%;
      /* 16.8px */
    }

    input,
    .el-select__selected-item {
      color: var(--main-label, #111827);

      /* subheadline1/semibold */
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
      line-height: 120%;
      /* 16.8px */
    }

    .is-transparent {
      color: var(--main-label-secondary, #9ca3af);
    }
  }

  .is-focus {
    outline: none;
    box-shadow: none;
  }

  .el-select {
    width: 100% !important;
  }

  .el-form-item__label {
    color: var(--main-label-secondary, #9ca3af);

    /* caption1/medium */
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: 120%;
    /* 14.4px */
  }

  .w-alert {
    border-radius: 16px;
    border: 1px solid var(--containers-warning-c, rgba(255, 149, 0, 0.1));
    background: var(--containers-warning-c, rgba(255, 149, 0, 0.1));
    color: var(--main-label-neutral, #6b7280);
    /* footnote/medium */
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    padding: 12px;

    .el-alert__title {
      line-height: 120%;
      /* 15.6px */
    }

    .el-icon {
      color: #ff9500;
    }
  }

  li {
    list-style: none;
  }

  .item {
    display: flex;
    padding: 20px 16px;
    align-items: center;
    gap: 16px;
    align-self: stretch;
    border-radius: 20px;
    background: radial-gradient(134.14% 132.32% at 2.08% 97.37%, #0663d2 0%, #044ca2 75.62%);
    text-decoration: none;
    position: relative;
    justify-content: space-between;

    p {
      color: var(--system-white, var(--Native-bg_color, #fff));

      /* footnote/medium */
      font-size: 13px;
      font-style: normal;
      font-weight: 500;
      line-height: 120%;
      /* 15.6px */
      opacity: 0.35;
    }

    .badge {
      position: absolute;
      right: 6px;
      bottom: 6px;
    }
  }

  .d-flex {
    display: flex;
    gap: 16px;
  }
}
</style>
