<script setup lang="ts">
import { format } from 'date-fns'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { deleteReportAPI, getReportsAPI, updateReportAPI } from '../../api/report'
import type { Report, ReportQuery } from '../../types/report'

const router = useRouter()

const loading = ref(false)
const tableData = ref<Report[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchForm = ref<ReportQuery>({
  type: '',
  status: '',
  target: 0,
  reporter: '',
  reason: '',
  startTime: null,
  endTime: null
})

const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const isPending = ref(false)
const form = ref({
  id: 0,
  status: '',
  admin_comment: ''
})

const rules = ref<FormRules>({
  status: [
    { required: true, message: '请选择处理结果', trigger: 'change' }
  ],
  admin_comment: [
    { required: true, message: '请输入处理说明', trigger: 'blur' }
  ]
})

const query = ref({
  ...searchForm.value,
  sort: '',
  order: ''
})

const fetchData = async () => {
  try {
    loading.value = true
    const params: ReportQuery = {
      ...searchForm.value,
      page: currentPage.value,
      page_size: pageSize.value,
      sort: query.value.sort,
      order: query.value.order
    }
    const res = await getReportsAPI(params)
    if (res.code === 0) {
      tableData.value = res.data.list
      total.value = res.data.total
    } else {
      ElMessage.error(res.error || '获取数据失败')
    }
  } catch (error) {
    console.error('获取举报列表失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const handleReset = () => {
  searchForm.value = {
    type: '',
    status: '',
    target: 0,
    reporter: '',
    reason: '',
    startTime: null,
    endTime: null
  }
  handleSearch()
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchData()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchData()
}

const getTypeText = (type: string) => {
  const map: Record<string, string> = {
    mod: '模组',
    user: '用户',
    comment: '评论'
  }
  return map[type] || type
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    processed: 'success',
    rejected: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待处理',
    processed: '已处理',
    rejected: '已驳回'
  }
  return map[status] || status
}

const handleReport = (row: Report) => {
  isPending.value = row.status === 'pending'
  form.value = {
    id: row.id,
    status: row.status,
    admin_comment: row.admin_comment || ''
  }
  dialogVisible.value = true
}

const handleSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  if (form.value.status === 'pending') {
    ElMessage.warning('请选择处理结果')
    return
  }
  if (!form.value.admin_comment) {
    ElMessage.warning('请输入处理说明')
    return
  }
  try {
    const res = await updateReportAPI(form.value.id, {
      status: form.value.status,
      admin_comment: form.value.admin_comment
    })
    if (res.code === 0) {
      ElMessage.success('处理成功')
      dialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.error || '处理失败')
    }
  } catch (error) {
    console.error('处理举报失败:', error)
    ElMessage.error('处理失败')
  }
}

const handleSort = ({ prop, order }: { prop: string; order: string }) => {
  const orderMap: Record<string, string> = {
    ascending: 'asc',
    descending: 'desc'
  }

  query.value.sort = prop
  query.value.order = order ? orderMap[order] : ''
  fetchData()
}

const handleTargetClick = (row: Report) => {
  if (row.type === 'comment') {
    router.push({
      path: '/comment',
      query: {
        id: row.target.toString()
      }
    })
  } else if (row.type === 'mod') {
    router.push(`/mod/${row.target}`)
  }
}

const handleDelete = async (row: Report) => {
  try {
    await ElMessageBox.confirm('确认要删除这条举报记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await deleteReportAPI(row.id)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.error || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除举报失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="report-management">
    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :model="searchForm" label-width="80px" class="search-form">
        <el-form-item label="举报类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable style="width: 180px;">
            <el-option label="模组" value="mod" />
            <el-option label="评论" value="comment" />
          </el-select>
        </el-form-item>
        <el-form-item label="举报对象">
          <el-input v-model="searchForm.target" placeholder="请输入举报对象ID" clearable type="number"
            @keyup.enter="handleSearch" style="width: 180px;" />
        </el-form-item>
        <el-form-item label="举报人">
          <el-input v-model="searchForm.reporter" placeholder="请输入举报人" clearable @keyup.enter="handleSearch"
            style="width: 180px;" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 180px;">
            <el-option label="待处理" value="pending" />
            <el-option label="已处理" value="processed" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="举报原因">
          <el-input v-model="searchForm.reason" placeholder="请输入举报原因" clearable @keyup.enter="handleSearch"
            style="width: 180px;" />
        </el-form-item>
        <el-form-item label="举报时间">
          <div class="date-picker-group">
            <el-date-picker v-model="searchForm.startTime" type="datetime" placeholder="开始日期"
              format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DDTHH:mm:ssZ" style="width: 180px" />
            <span class="date-separator">至</span>
            <el-date-picker v-model="searchForm.endTime" type="datetime" placeholder="结束日期" format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DDTHH:mm:ssZ" style="width: 180px" />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon>
              <Search />
            </el-icon>搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon>
              <RefreshRight />
            </el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card>
      <el-table :data="tableData" style="width: 100%" v-loading="loading" border @sort-change="handleSort">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="type" label="举报类型" width="100" align="center">
          <template #default="{ row }">
            {{ getTypeText(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="target" label="举报对象ID" width="120" align="center">
          <template #default="{ row }">
            <el-button v-if="row.type === 'mod' || row.type === 'comment'" link type="primary"
              @click="handleTargetClick(row)">
              {{ row.target }}
            </el-button>
            <span v-else>{{ row.target }}</span>
          </template>
        </el-table-column>
        <el-table-column label="举报人" width="120" align="center">
          <template #default="{ row }">
            {{ row.reporter?.user_name || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="举报原因" min-width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="举报时间" width="180" align="center" sortable="custom">
          <template #default="{ row }">
            {{ format(row.created_at, 'yyyy-MM-dd HH:mm:ss') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button size="small" :type="row.status === 'pending' ? 'primary' : 'info'" @click="handleReport(row)">
              {{ row.status === 'pending' ? '处理' : '查看' }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 处理对话框 -->
    <el-dialog v-model="dialogVisible" :title="isPending ? '举报处理' : '举报详情'" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" label-width="100px">
        <el-form-item label="处理结果" v-if="isPending">
          <el-radio-group v-model="form.status">
            <el-radio label="processed">处理</el-radio>
            <el-radio label="rejected">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理说明">
          <el-input v-model="form.admin_comment" type="textarea" :rows="4" placeholder="请输入处理说明"
            :disabled="!isPending" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit(formRef)" v-if="isPending">
            提交
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.report-management {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  min-height: 100vh;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-start;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 0;
  flex: 0 0 auto;
}

.date-picker-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-separator {
  color: var(--el-text-color-regular);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-table) {
  margin-top: 10px;

  .el-button {
    padding: 4px 12px;
  }
}

:deep(.el-button--link) {
  padding: 0;
  height: auto;
  font-weight: normal;

  &:hover {
    text-decoration: underline;
  }
}
</style>