<script setup lang="ts">
import { format } from 'date-fns'
import type { FormInstance, FormRules, UploadInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref } from 'vue'
import { apiUrl } from '../../api'
import { createGameAPI, deleteGameAPI, getGamesAPI, updateGameAPI } from '../../api/game'
import type { CreateGameRequest, Game, GameList, GameQuery, UpdateGameRequest } from '../../types/game'
import { getToken } from '../../utils/token'

const loading = ref(false)
const gameList = ref<GameList>()
const query = ref<GameQuery>({
  name: '',
  developers: '',
  publishers: '',
  page: 1,
  page_size: 10,
  sort: '',
  order: '',
})

// 获取游戏列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const { data } = await getGamesAPI(query.value)
    gameList.value = data
  } catch (error) {
    ElMessage.error('获取游戏列表失败')
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
  developers: '',
  publishers: ''
})

const uploadFinish = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
const uploadRef = ref<UploadInstance>()
const form = ref({
  id: 0,
  nameZh: '',
  nameEn: '',
  developers: '',
  publishers: '',
  release_time: '',
  logo_id: 0,
  old_logo_id: 0
})

const headers = ref({
  Authorization: getToken()
})

// 封面上传相关
const logoUrl = ref('')
const previewUrl = ref('')
const handleLogoSuccess = (response: any) => {
  form.value.logo_id = response.data.file_id
  uploadFinish.value = true
}

interface UploadFile extends File {
  raw: File
}

const handleLogoChange = (file: UploadFile) => {
  previewUrl.value = URL.createObjectURL(file.raw)
}

const beforeLogoUpload = (file: File) => {
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('封面只能是 JPG/PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('封面大小不能超过 2MB!')
  }
  return isImage && isLt2M
}

const rules = ref<FormRules>({
  nameZh: [
    { required: true, message: '请输入游戏中文名称', trigger: 'blur' }
  ],
  nameEn: [
    { required: true, message: '请输入游戏英文名称', trigger: 'blur' }
  ],
  developers: [
    { required: true, message: '请输入开发商', trigger: 'blur' }
  ],
  publishers: [
    { required: true, message: '请输入发行商', trigger: 'blur' }
  ],
  release_time: [
    { required: true, message: '请选择发行日期', trigger: 'change' }
  ]
})

const handleSearch = () => {
  query.value.page = 1
  query.value.name = searchForm.value.name
  query.value.developers = searchForm.value.developers
  query.value.publishers = searchForm.value.publishers
  fetchData()
}

const handleReset = () => {
  searchForm.value = {
    name: '',
    developers: '',
    publishers: ''
  }
  query.value = {
    name: '',
    developers: '',
    publishers: '',
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
  dialogTitle.value = '添加游戏'
  form.value = {
    id: 0,
    nameZh: '',
    nameEn: '',
    developers: '',
    publishers: '',
    release_time: '',
    logo_id: 0,
    old_logo_id: 0
  }
  logoUrl.value = ''
  previewUrl.value = ''
  dialogVisible.value = true
}

const handleEdit = (row: Game) => {
  dialogTitle.value = '编辑游戏'
  const [nameZh, nameEn] = row.name.split('|')
  form.value = {
    id: row.id,
    nameZh,
    nameEn,
    developers: row.developers,
    publishers: row.publishers,
    release_time: row.release_time,
    logo_id: row.logo_id,
    old_logo_id: row.logo_id
  }
  logoUrl.value = row.logo_file.url
  previewUrl.value = ''
  dialogVisible.value = true
}

const handleDelete = (row: Game) => {
  ElMessageBox.confirm(
    '确认删除该游戏？删除后该游戏下的所有模组将无法访问。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await deleteGameAPI(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 添加游戏提交
const handleAddSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        uploadRef.value?.submit()
        setTimeout(async () => {
          if (uploadFinish.value) {
            const name = `${form.value.nameZh}|${form.value.nameEn}`
            const addData: CreateGameRequest = {
              name,
              developers: form.value.developers,
              publishers: form.value.publishers,
              release_time: form.value.release_time,
              logo_id: form.value.logo_id
            }
            await createGameAPI(addData)
            ElMessage.success('添加成功')
            dialogVisible.value = false
            handleSearch()
          }
        }, 500)
      } catch (error) {
        ElMessage.error('添加失败')
      }
      uploadFinish.value = false
    }
  })
}

// 编辑游戏提交
const handleEditSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        uploadRef.value?.submit()
        setTimeout(async () => {
          if (uploadFinish.value) {
            const name = `${form.value.nameZh}|${form.value.nameEn}`
            const editData: UpdateGameRequest = {
              name,
              developers: form.value.developers,
              publishers: form.value.publishers,
              release_time: form.value.release_time,
              old_logo_id: form.value.old_logo_id,
              new_logo_id: form.value.logo_id
            }
            await updateGameAPI(form.value.id, editData)
            ElMessage.success('编辑成功')
            dialogVisible.value = false
            handleSearch()
          }
        }, 500)
      } catch (error) {
        ElMessage.error('编辑失败')
      }
      uploadFinish.value = false
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
    developers: 'developers',
    publishers: 'publishers',
    release_time: 'release_time',
    mod_nums: 'mod_nums'
  }

  query.value.sort = sortMap[prop] || ''
  query.value.order = order ? orderMap[order] : ''
  fetchData()
}
</script>

<template>
  <div class="game-management">
    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="游戏名称">
          <el-input v-model="searchForm.name" placeholder="请输入游戏名称" clearable @keyup.enter="handleSearch"
            style="width: 150px;" />
        </el-form-item>
        <el-form-item label="开发商">
          <el-input v-model="searchForm.developers" placeholder="请输入开发商" clearable @keyup.enter="handleSearch"
            style="width: 150px;" />
        </el-form-item>
        <el-form-item label="发行商">
          <el-input v-model="searchForm.publishers" placeholder="请输入发行商" clearable @keyup.enter="handleSearch"
            style="width: 150px;" />
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
        </el-icon>添加游戏
      </el-button>
    </div>

    <el-table v-loading="loading" :data="gameList?.list" style="width: 100%" v-if="gameList != undefined"
      @sort-change="handleSort">
      <el-table-column type="index" label="#" width="80" />
      <el-table-column label="封面" width="100">
        <template #default="{ row }">
          <el-image v-if="row.logo_file?.url" :src="row.logo_file.url" fit="cover"
            style="width: 60px; height: 60px; border-radius: 4px;" />
          <el-icon v-else style="font-size: 40px; color: #909399;">
            <Picture />
          </el-icon>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="游戏名称" min-width="150" show-overflow-tooltip sortable="custom" />
      <el-table-column prop="developers" label="开发商" min-width="150" show-overflow-tooltip sortable="custom" />
      <el-table-column prop="publishers" label="发行商" min-width="150" show-overflow-tooltip sortable="custom" />
      <el-table-column prop="release_time" label="发行日期" width="120" sortable="custom">
        <template #default="{ row }">
          {{ format(row.release_time, "yyyy-MM-dd") }}
        </template>
      </el-table-column>
      <el-table-column prop="mod_nums" label="模组数量" width="100" sortable="custom" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination v-model:current-page="query.page" v-model:page-size="query.page_size"
        :page-sizes="[10, 20, 50, 100]" :total="gameList?.total || 0" layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="游戏封面">
          <el-upload ref="uploadRef" class="cover-uploader" :action="`${apiUrl}/upload/file?type=game_logo`"
            :show-file-list="false" :on-success="handleLogoSuccess" :before-upload="beforeLogoUpload"
            :auto-upload="false" :headers="headers" :on-change="handleLogoChange">
            <img v-if="logoUrl || previewUrl" :src="previewUrl || logoUrl" class="cover" />
            <el-icon v-else class="cover-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
          <div class="upload-tip">支持 JPG、PNG 格式，大小不超过 2MB</div>
        </el-form-item>
        <el-form-item label="中文名称" prop="nameZh">
          <el-input v-model="form.nameZh" placeholder="请输入游戏中文名称" />
        </el-form-item>
        <el-form-item label="英文名称" prop="nameEn">
          <el-input v-model="form.nameEn" placeholder="请输入游戏英文名称" />
        </el-form-item>
        <el-form-item label="开发商" prop="developers">
          <el-input v-model="form.developers" />
        </el-form-item>
        <el-form-item label="发行商" prop="publishers">
          <el-input v-model="form.publishers" />
        </el-form-item>
        <el-form-item label="发行日期" prop="release_time">
          <el-date-picker v-model="form.release_time" type="date" placeholder="选择日期" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary"
            @click="dialogTitle === '添加游戏' ? handleAddSubmit(formRef) : handleEditSubmit(formRef)">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.game-management {
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

.cover-uploader {
  text-align: center;
}

.cover-uploader .cover {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}

.cover-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.cover-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.upload-tip {
  font-size: 12px;
  color: #666;
  margin-top: 10px;
  text-align: center;
}
</style>