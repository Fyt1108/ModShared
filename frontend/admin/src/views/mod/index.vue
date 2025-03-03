<script setup lang="ts">
import { format } from 'date-fns'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getCategoryAPI } from '../../api/categories'
import { getGamesAPI } from '../../api/game'
import { deleteModAPI, getModsAPI, updateModAPI } from '../../api/mod'
import type { Categories } from '../../types/categories'
import type { Game } from '../../types/game'
import type { ModList, ModQuery, Mods } from '../../types/mod'

const router = useRouter()
const loading = ref(false)
const modList = ref<ModList>()
const gameList = ref<Game[]>([])
const categoryList = ref<Categories[]>([])

const query = ref<ModQuery>({
  name: '',
  category: [],
  gameID: 0,
  status: '',
  page: 1,
  page_size: 10,
  sort: '',
  order: '',
  userName: ''
})

// 获取模组列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const { data } = await getModsAPI(query.value)
    modList.value = data
  } catch (error) {
    ElMessage.error('获取模组列表失败')
  } finally {
    loading.value = false
  }
}

// 获取游戏列表
const fetchGameList = async () => {
  try {
    const { data } = await getGamesAPI({
      developers: '',
      publishers: '',
      page: 1,
      page_size: 100,
      sort: '',
      order: ''
    })
    gameList.value = data.list
  } catch (error) {
    ElMessage.error('获取游戏列表失败')
  }
}

// 获取分类列表
const fetchCategoryList = async () => {
  try {
    const { data } = await getCategoryAPI({
      name: '',
      status: 'enable',
      page: 1,
      page_size: 100,
      sort: '',
      order: ''
    })
    categoryList.value = data.list
  } catch (error) {
    ElMessage.error('获取分类列表失败')
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchData()
  fetchGameList()
  fetchCategoryList()
})

const searchForm = ref({
  name: '',
  game: '',
  category: '',
  author: '',
  status: ''
})

const handleSearch = () => {
  query.value.page = 1
  query.value.name = searchForm.value.name
  query.value.gameID = Number(searchForm.value.game) || 0
  query.value.category = searchForm.value.category ? [searchForm.value.category] : []
  query.value.status = searchForm.value.status
  query.value.userName = searchForm.value.author
  fetchData()
}

const handleReset = () => {
  searchForm.value = {
    name: '',
    game: '',
    category: '',
    author: '',
    status: ''
  }
  query.value = {
    name: '',
    category: [],
    gameID: 0,
    status: '',
    page: 1,
    page_size: 10,
    sort: '',
    order: '',
    userName: ''
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

const handleDelete = (row: Mods) => {
  ElMessageBox.confirm(
    '确认删除该模组？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await deleteModAPI(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

const handleView = (row: Mods) => {
  router.push(`/mod/${row.id}`)
}

const handleApprove = async (row: Mods) => {
  try {
    await updateModAPI(row.id, {
      content: row.content,
      description: row.description,
      status: 'enable'
    })
    ElMessage.success('审核通过')
    fetchData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleReject = async (row: Mods) => {
  try {
    await updateModAPI(row.id, {
      content: row.content,
      description: row.description,
      status: 'disable'
    })
    ElMessage.success('已拒绝')
    fetchData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
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
    total_downloads: 'total_downloads',
    created_at: 'created_at',
    last_update: 'last_update'
  }

  query.value.sort = sortMap[prop] || ''
  query.value.order = order ? orderMap[order] : ''
  fetchData()
}
</script>

<template>
  <div class="mod-management">
    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="模组名称">
          <el-input v-model="searchForm.name" placeholder="请输入模组名称" clearable @keyup.enter="handleSearch"
            style="width: 150px;" />
        </el-form-item>
        <el-form-item label="游戏">
          <el-select v-model="searchForm.game" placeholder="请选择游戏" clearable style="width: 150px;">
            <el-option v-for="game in gameList" :key="game.id" :label="game.name.split('|')[0]" :value="game.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="请选择分类" clearable style="width: 150px;">
            <el-option v-for="category in categoryList" :key="category.id" :label="category.name.split('|')[0]"
              :value="category.name.split('|')[0]" />
          </el-select>
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="searchForm.author" placeholder="请输入作者" clearable @keyup.enter="handleSearch"
            style="width: 150px;" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 150px;">
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="enable" />
            <el-option label="未通过" value="disable" />
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

    <el-table v-loading="loading" :data="modList?.list" style="width: 100%" v-if="modList != undefined"
      @sort-change="handleSort">
      <el-table-column type="index" label="#" width="80" />
      <el-table-column prop="name" label="模组名称" min-width="150" show-overflow-tooltip sortable="custom" />
      <el-table-column prop="game.name" label="游戏" width="120" show-overflow-tooltip />
      <el-table-column prop="category" label="分类" width="120" />
      <el-table-column prop="user.user_name" label="作者" width="120" show-overflow-tooltip />
      <el-table-column prop="total_downloads" label="下载量" width="100" sortable="custom" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'enable' ? 'success' : row.status === 'disable' ? 'danger' : 'warning'">
            {{ row.status === 'enable' ? '已通过' : row.status === 'disable' ? '已通过' : '未通过' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="last_update" label="最后更新" width="150" sortable="custom">
        <template #default="{ row }">
          {{ format(row.last_update, "yyyy-MM-dd HH:mm") }}
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="150" sortable="custom">
        <template #default="{ row }">
          {{ format(row.created_at, "yyyy-MM-dd HH:mm") }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleView(row)">查看</el-button>
          <el-button v-if="row.status === 'pending' || row.status === 'disable'" size="small" type="success"
            @click="handleApprove(row)">通过</el-button>
          <el-button v-if="row.status === 'pending' || row.status === 'enable'" size="small" type="danger"
            @click="handleReject(row)">拒绝</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination v-model:current-page="query.page" v-model:page-size="query.page_size"
        :page-sizes="[10, 20, 50, 100]" :total="modList?.total || 0" layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>
  </div>
</template>

<style scoped>
.mod-management {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>