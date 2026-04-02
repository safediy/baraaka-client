<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-unused-vars */
import { onMounted, ref, watch } from 'vue'
import clientService from '@/api/ClientService'
import { getAllowRoles } from '@/utils/permission'
import { useI18n } from 'vue-i18n'
import constant from '@/utils/constant'
import regionService from '@/api/RegionService'

const { t } = useI18n()

defineOptions({
  name: 'BSelect'
})

const emit = defineEmits(['update:modelValue'])

const props = defineProps({
  type: String,
  modelValue: [String, Number],
  styleString: {
    type: String,
    default: 'width: 200px'
  },
  clearable: {
    type: Boolean,
    default: true
  }
})

const waybillStatusDesc: any = constant.WAYBILL_STATUS_DESCRIPTION

const selectedValue = ref(props.modelValue)

const optionData = ref(<any>[])

onMounted(async () => {
  optionData.value = await getOptions()
})

const getOptions = async function () {
  switch (props.type) {
    case 'role':
      return getAllowRoles().map((role) => {
        return {
          label: t('role.' + role),
          value: role
        }
      })
    case 'waybillStatus':
      return Object.keys(waybillStatusDesc).map((key) => {
        return {
          label: waybillStatusDesc[key],
          value: key
        }
      })
    // case 'district':
    //   const districts: any = await regionService.getDistiricts(14)

    //   return districts.map((district: any) => {
    //     return {
    //       label: district.nameUz,
    //       value: district.id
    //     }
    //   })
    case 'client': {
      const clients: any[] = await clientService.query()
      return clients.map((client: any) => {
        return {
          label: `${client.code} - ${client.name}`,
          value: client.id
        }
      })
    }
    default:
      return []
  }
}

watch(
  () => props.modelValue,
  (val) => {
    selectedValue.value = val
  }
)
watch(
  () => selectedValue.value,
  (val) => {
    emit('update:modelValue', val)
  }
)
</script>

<template>
  <el-select-v2
    v-model="selectedValue"
    :options="optionData"
    :props="{ label: 'label', value: 'value' }"
    filterable
    :clearable="clearable"
    :style="styleString"
    width="100%"
    :placeholder="$t('placeholder.select')"
  />
</template>

<style scoped lang="scss"></style>
