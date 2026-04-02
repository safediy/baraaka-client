<script lang="ts" setup>
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { CirclePlus, Refresh, Search } from '@element-plus/icons-vue'
import { usePagination } from '@/hooks/usePagination'
import { isObject, omitBy } from 'lodash-es'
import { useI18n } from 'vue-i18n'
import { confirmBox } from '@/components/BMessageBox'

const { t } = useI18n()

defineOptions({
  // 命名当前组件
  name: 'PageTable'
})

const props = defineProps({
  service: {
    type: Object,
    required: true
  },
  search: {
    type: Object,
    default: () => ({})
  },
  join: {
    type: Array,
    default: () => []
  },
  defaultOperate: {
    type: Boolean,
    default: false
  },
  showDelete: {
    type: Boolean,
    default: false
  },
  showAdd: {
    type: Boolean,
    default: true
  }
})

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const tableData = ref<object[]>([])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive(props.search)

const getTableData = async () => {
  loading.value = true
  const data: any = await props.service.query({
    page: paginationData.currentPage,
    limit: paginationData.pageSize,
    offset: (paginationData.currentPage - 1) * paginationData.pageSize,
    s: { ...searchData },
    join: props.join
  })
  paginationData.total = data.total
  tableData.value = data.data
  loading.value = false
}

const handleSearch = () => {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

const handleDelete = async (row: any) => {
  if (await confirmBox(t, t('message.confirm.delete'))) {
    await props.service.delete(row.id)
    ElMessage.success(t('message.success'))
    getTableData()
  }
}

const emit = defineEmits(['showDialog'])
const handleUpdate = (row: any) => {
  emit('showDialog', omitBy(row, isObject))
}
const handleCreate = () => {
  emit('showDialog', undefined)
}

let tableHeight = 0
const calculateTableHeight = function () {
  // 这里的 200 是你的页面其他元素占用的高度，你需要根据实际情况进行调整
  tableHeight = window.innerHeight - 300
}

onMounted(() => {
  calculateTableHeight()
  window.addEventListener('resize', calculateTableHeight)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', calculateTableHeight)
})

//#endregion

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })

defineExpose({
  handleSearch,
  resetSearch
})
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <slot name="search" />
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">{{ $t('search') }}</el-button>
          <el-button type="primary" v-if="showAdd" :icon="CirclePlus" @click="handleCreate">{{ $t('add') }}</el-button>
          <el-button :icon="Refresh" @click="resetSearch">{{ $t('reset') }}</el-button>
          <slot name="headerEnd" />
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="table-wrapper">
        <el-table :data="tableData" table-layout="fixed" :height="tableHeight">
          <slot name="columns" />
          <el-table-column v-if="defaultOperate" fixed="right" :label="$t('operate')" width="150" align="center">
            <template #default="scope">
              <el-button type="primary" text bg size="small" @click="handleUpdate(scope.row)">{{
                $t('edit')
              }}</el-button>
              <el-button type="danger" text bg size="small" v-if="showDelete" @click="handleDelete(scope.row)">{{
                $t('delete')
              }}</el-button>
              <slot name="extraButtons" :row="scope.row" />
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager-wrapper">
        <el-pagination
          :layout="paginationData.layout"
          :page-sizes="paginationData.pageSizes"
          :total="paginationData.total"
          :page-size="paginationData.pageSize"
          :currentPage="paginationData.currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <slot name="dialog" />
  </div>
</template>

<style lang="scss" scoped>
.search-wrapper {
  margin-bottom: 2px;
  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
