<script setup lang="ts">
import { format } from 'date-fns'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { onMounted, ref } from 'vue'
import { deleteUserAPI, getUsersAPI, UpdateUserStateAPI } from '../../api/user'
import type { UpdateUserState, User, UserList, UserQuery } from '../../types/user'

//const { t } = useI18n()

const userQuery = ref<UserQuery>({
  username: '',
  email: '',
  role: 'all',
  status: "enable",
  page: 1,
  page_size: 10,
  sort: "",
  order: "",
})

const userData = ref<UserList>()

onMounted(async () => {
  const data = await getUsersAPI(userQuery.value)
  userData.value = data.data
})

const searchForm = ref({
  username: '',
  email: '',
  role: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()

const form = ref({
  id: 0,
  role: '',
  status: true
})

const rules = ref<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
})

const handleSearch = async () => {
  userQuery.value.page = 1
  const data = await getUsersAPI(userQuery.value)
  userData.value = data.data
}

const handleReset = () => {
  userQuery.value.username = ''
  userQuery.value.email = ''
  userQuery.value.role = 'all'
  userQuery.value.status = "enable"
  handleSearch()
}

const handleSizeChange = (val: number) => {
  userQuery.value.page_size = val
  handleSearch()
}

const handleCurrentChange = (val: number) => {
  userQuery.value.page = val
  handleSearch()
}

const handleEdit = (row: User) => {
  dialogTitle.value = '编辑用户'
  form.value = {
    id: row.id,
    role: row.role === 'admin' ? '管理员' : '用户',
    status: row.status === "enable"
  }
  dialogVisible.value = true
}

const handleDelete = (row: User) => {
  console.log(row.id)
  ElMessageBox.confirm(
    '确认删除该用户？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await deleteUserAPI(row.id)
      ElMessage({
        type: 'success',
        message: '删除成功',
      })
    } catch {
      ElMessage({
        type: 'error',
        message: '删除失败',
      })
    }
  })
}

const handleSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid) => {
    if (valid) {
      const data: UpdateUserState = {
        role: form.value.role === '管理员' ? 'admin' : 'user',
        status: form.value.status ? 'enable' : 'disable'
      }

      try {
        await UpdateUserStateAPI(form.value.id, data)
        ElMessage({
          type: 'success',
          message: '操作成功',
        })
        handleSearch()
      } catch {
        ElMessage({
          type: 'error',
          message: '操作失败',
        })
      }
      dialogVisible.value = false
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
    username: 'user_name',
    last_login: 'last_login',
    created_at: 'created_at'
  }

  userQuery.value.sort = sortMap[prop] || ''
  userQuery.value.order = order ? orderMap[order] : ''
  handleSearch()
}
</script>

<template>
  <div class="user-management">
    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户名">
          <el-input v-model="userQuery.username" style="width: 150px;" placeholder="请输入用户名" clearable
            @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userQuery.email" style="width: 150px;" placeholder="请输入邮箱" clearable
            @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="userQuery.status" style="width: 100px;">
            <el-option label="正常" value="enable" />
            <el-option label="禁用" value="disable" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="userQuery.role" style="width: 100px;">
            <el-option label="所有用户" value="all" />
            <el-option label="用户" value="user" />
            <el-option label="管理员" value="admin" />
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

    <el-table :data="userData?.list" style="width: 100%" v-if="userData != undefined" @sort-change="handleSort">
      <el-table-column type="index" label="#" width="80" />
      <el-table-column prop="user_name" label="用户名" min-width="120" show-overflow-tooltip sortable="custom" />
      <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
      <el-table-column prop="role" label="角色" width="100">
        <template #default="{ row }">
          <el-tag>{{ row.role }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'enable' ? 'success' : 'danger'">
            {{ row.status === 'enable' ? '已启用' : '已禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="last_login" label="最后登录" width="180" sortable="custom">
        <template #default="{ row }">
          {{ row.last_login ? format(row.last_login, "yyyy-MM-dd HH:mm") : '从未登录' }}
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180" sortable="custom">
        <template #default="{ row }">
          {{ format(row.created_at, "yyyy-MM-dd HH:mm") }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)" v-if="row.user_name !== 'EurekaYT'">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)"
            v-if="row.user_name !== 'EurekaYT'">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination v-model:current-page="userQuery.page" v-model:page-size="userQuery.page_size"
        :page-sizes="[10, 20, 50, 100]" :total="userData?.total || 0" layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="管理员" value="管理员" />
            <el-option label="普通用户" value="普通用户" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit(formRef)">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.user-management {
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