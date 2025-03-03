<script setup lang="ts">
import { format } from 'date-fns'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref } from 'vue'
import { createCategoryAPI, deleteCategoryAPI, getCategoryAPI, updateCategoryAPI } from '../../api/categories'
import type { Categories, CategoriesList, CategoriesQuery, CreateCategories } from '../../types/categories'

const loading = ref(false)
const categoryList = ref<CategoriesList>()
const query = ref<CategoriesQuery>({
  name: '',
  status: '',
  page: 1,
  page_size: 10,
  sort: '',
  order: '',
})

// 获取分类列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const { data } = await getCategoryAPI(query.value)
    categoryList.value = data
  } catch (error) {
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchData()
})

const searchForm = ref({
  name: '',
  status: "enable"
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
const form = ref({
  id: 0,
  nameZh: '',
  nameEn: '',
  status: true
})

const rules = ref<FormRules>({
  nameZh: [
    { required: true, message: '中文名称', trigger: 'blur' }
  ],
  nameEn: [
    { required: true, message: '英文名称', trigger: 'blur' }
  ]
})

const handleSearch = () => {
  query.value.page = 1
  query.value.name = searchForm.value.name
  query.value.status = searchForm.value.status
  fetchData()
}

const handleReset = () => {
  searchForm.value = {
    name: '',
    status: ''
  }
  query.value = {
    name: '',
    status: '',
    page: 1,
    page_size: 10,
    sort: '',
    order: '',
  }
  fetchData()
}

const handleSizeChange = (val: number) => {
  query.value.page_size = val
  fetchData()
}

const handleCurrentChange = (val: number) => {
  query.value.page = val
  fetchData()
}

const handleAdd = () => {
  dialogTitle.value = '添加分类'
  form.value = {
    id: 0,
    nameZh: '',
    nameEn: '',
    status: true
  }
  dialogVisible.value = true
}

const handleEdit = (row: Categories) => {
  dialogTitle.value = '编辑分类'
  const [nameZh, nameEn] = row.name.split('|')
  form.value = {
    id: row.id,
    nameZh,
    nameEn,
    status: row.status === 'enable' ? true : false
  }
  dialogVisible.value = true
}

const handleDelete = (row: Categories) => {
  ElMessageBox.confirm(
    '确认删除该分类？删除后该分类下的所有模组将被移至默认分类。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await deleteCategoryAPI(row.id)
      ElMessage({
        type: 'success',
        message: '删除成功',
      })
      fetchData()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 添加分类提交
const handleAddSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        const name = `${form.value.nameZh}|${form.value.nameEn}`
        const addData: CreateCategories = {
          name,
          status: form.value.status ? "enable" : "disable"
        }
        await createCategoryAPI(addData)
        ElMessage.success('添加成功')
        dialogVisible.value = false
        handleSearch()
      } catch (error) {
        ElMessage.error('添加失败')
      }
    }
  })
}

// 编辑分类提交
const handleEditSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        const name = `${form.value.nameZh}|${form.value.nameEn}`
        const editData: CreateCategories = {
          name,
          status: form.value.status ? "enable" : "disable"
        }
        await updateCategoryAPI(form.value.id, editData)
        ElMessage.success('编辑成功')
        dialogVisible.value = false
        handleSearch()
      } catch (error) {
        ElMessage.error('编辑失败')
      }
    }
  })
}

// 添加排序处理函数
const handleSort = ({ prop, order }: { prop: string; order: string }) => {
  // 将element-plus的排序值转换为API所需格式
  const orderMap: Record<string, string> = {
    ascending: 'asc',
    descending: 'desc'
  }

  // 根据排序字段映射
  const sortMap: Record<string, string> = {
    name: 'name',
    created_at: 'created_at'
  }

  query.value.sort = sortMap[prop] || ''
  query.value.order = order ? orderMap[order] : ''
  fetchData()
}
</script>

<template>
  <div class="category-management">
    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="分类名称">
          <el-input v-model="searchForm.name" placeholder="请输入分类名称" clearable @keyup.enter="handleSearch"
            style="width: 150px;" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" style="width: 100px;">
            <el-option label="已启用" value="enable" />
            <el-option label="已禁用" value="disable" />
          </el-select>
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

    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">
        <el-icon>
          <Plus />
        </el-icon>添加分类
      </el-button>
    </div>

    <el-table v-loading="loading" :data="categoryList?.list" style="width: 100%" v-if="categoryList != undefined"
      @sort-change="handleSort">
      <el-table-column type="index" label="#" width="80" />
      <el-table-column prop="name" label="分类名称" min-width="150" show-overflow-tooltip sortable="custom" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'enable' ? 'success' : 'danger'">
            {{ row.status === 'enable' ? '已启用' : '已禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180" sortable="custom">
        <template #default="{ row }">
          {{ format(row.created_at, "yyyy-MM-dd HH:mm") }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination v-model:current-page="query.page" v-model:page-size="query.page_size"
        :page-sizes="[10, 20, 50, 100]" :total="categoryList?.total || 0"
        layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="中文名称" prop="nameZh">
          <el-input v-model="form.nameZh" />
        </el-form-item>
        <el-form-item label="英文名称" prop="nameEn">
          <el-input v-model="form.nameEn" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary"
            @click="dialogTitle === '添加分类' ? handleAddSubmit(formRef) : handleEditSubmit(formRef)">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.category-management {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.toolbar {
  margin-bottom: 20px;
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
</style>