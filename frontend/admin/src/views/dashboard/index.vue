<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAllCommentsAPI } from '../../api/comment'
import { getModsAPI } from '../../api/mod'
import { getReportsAPI } from '../../api/report'
import { getUsersAPI } from '../../api/user'
import type { ModList } from '../../types/mod'
import type { ReportList } from '../../types/report'

const router = useRouter()
const loading = ref(false)

// 统计数据
const stats = ref({
  pendingMods: 0,
  totalMods: 0,
  totalUsers: 0,
  pendingReports: 0,
  totalReports: 0,
  totalComments: 0
})

// 最新待审核模组
const pendingMods = ref<ModList>()
// 最新举报
const latestReports = ref<ReportList>()

// 获取统计数据
const fetchStats = async () => {
  loading.value = true
  try {
    // 获取模组统计
    const modsRes = await getModsAPI({
      page: 1,
      page_size: 5,
      status: 'pending'
    })
    if (modsRes.code === 0) {
      stats.value.pendingMods = modsRes.data.total
      pendingMods.value = modsRes.data
    }

    const allModsRes = await getModsAPI({
      page: 1,
      page_size: 1
    })
    if (allModsRes.code === 0) {
      stats.value.totalMods = allModsRes.data.total
    }

    // 获取用户统计
    const usersRes = await getUsersAPI({
      page: 1,
      page_size: 1
    })
    if (usersRes.code === 0) {
      stats.value.totalUsers = usersRes.data.total
    }

    // 获取举报统计
    const reportsRes = await getReportsAPI({
      page: 1,
      page_size: 5,
      status: 'pending'
    })
    if (reportsRes.code === 0) {
      stats.value.pendingReports = reportsRes.data.total
      latestReports.value = reportsRes.data
    }

    const allReportsRes = await getReportsAPI({
      page: 1,
      page_size: 1
    })
    if (allReportsRes.code === 0) {
      stats.value.totalReports = allReportsRes.data.total
    }

    // 获取评论统计
    const commentsRes = await getAllCommentsAPI({
      page: 1,
      page_size: 1
    })
    if (commentsRes.code === 0) {
      stats.value.totalComments = commentsRes.data.total
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 跳转函数
const goToMods = () => router.push('/mod')
const goToUsers = () => router.push('/user')
const goToReports = () => router.push('/report')
const goToComments = () => router.push('/comment')
const goToModDetail = (id: number) => router.push(`/mod/${id}`)
const goToReportManagement = () => router.push('/report')

onMounted(() => {
  fetchStats()
})
</script>

<template>
  <div class="dashboard">
    <!-- 数据概览卡片 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover" @click="goToMods">
          <div class="stat-content">
            <div class="stat-icon warning">
              <el-icon>
                <Warning />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">待审核模组</div>
              <div class="stat-number">{{ stats.pendingMods }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card" shadow="hover" @click="goToReports">
          <div class="stat-content">
            <div class="stat-icon danger">
              <el-icon>
                <AlarmClock />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">待处理举报</div>
              <div class="stat-number">{{ stats.pendingReports }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card" shadow="hover" @click="goToUsers">
          <div class="stat-content">
            <div class="stat-icon primary">
              <el-icon>
                <User />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">用户总数</div>
              <div class="stat-number">{{ stats.totalUsers }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card" shadow="hover" @click="goToComments">
          <div class="stat-content">
            <div class="stat-icon success">
              <el-icon>
                <ChatDotRound />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">评论总数</div>
              <div class="stat-number">{{ stats.totalComments }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="dashboard-content">
      <!-- 待审核模组列表 -->
      <el-col :span="12">
        <el-card class="list-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>待审核模组</span>
              <el-button link @click="goToMods">查看全部</el-button>
            </div>
          </template>
          <el-table :data="pendingMods?.list" style="width: 100%">
            <el-table-column prop="name" label="模组名称" min-width="150" show-overflow-tooltip />
            <el-table-column prop="user.user_name" label="作者" width="120" />
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="goToModDetail(row.id)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 最新举报列表 -->
      <el-col :span="12">
        <el-card class="list-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>最新举报</span>
              <el-button link @click="goToReportManagement">查看全部</el-button>
            </div>
          </template>
          <el-table :data="latestReports?.list" style="width: 100%">
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="row.type === 'mod' ? 'primary' : 'success'">
                  {{ row.type === 'mod' ? '模组' : '评论' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="reason" label="举报原因" min-width="150" show-overflow-tooltip />
            <el-table-column prop="reporter.user_name" label="举报人" width="120" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  min-height: 100vh;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
  }
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  .el-icon {
    font-size: 24px;
    color: white;
  }

  &.warning {
    background-color: var(--el-color-warning);
  }

  &.danger {
    background-color: var(--el-color-danger);
  }

  &.primary {
    background-color: var(--el-color-primary);
  }

  &.success {
    background-color: var(--el-color-success);
  }
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.dashboard-content {
  margin-top: 20px;
}

.list-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart {
  height: 350px;
  width: 100%;
}

@media screen and (max-width: 1400px) {
  .chart {
    height: 300px;
  }
}

@media screen and (max-width: 1200px) {
  .chart {
    height: 280px;
  }
}

@media screen and (max-width: 992px) {
  .dashboard {
    min-width: auto;
  }

  .chart {
    height: 250px;
  }
}
</style>