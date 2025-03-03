<script setup lang="ts">
import { format } from 'date-fns'
import edjsHTML from 'editorjs-html'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getModAPI, updateModAPI } from '../../api/mod'
import { deleteModVersion, getModVersions, updateCount } from '../../api/mod_version'
import type { Mod } from '../../types/mod'
import type { ModVersion } from '../../types/mod_version'

const route = useRoute()
const router = useRouter()
const modId = route.params.id
const loading = ref(true)
const activeTab = ref('content')
const contentHtml = ref('')

const modDetail = ref<Mod>()
const versionList = ref<ModVersion[]>([])
const edjsParser = edjsHTML()

// 获取模组详情
const fetchModDetail = async () => {
  loading.value = true
  try {
    const { data } = await getModAPI(modId as string)
    modDetail.value = data
    // 解析 EditorJS 内容
    if (modDetail.value?.content) {
      const json = JSON.parse(modDetail.value.content)
      const htmlArray = edjsParser.parse(json)
      contentHtml.value = htmlArray
    }
    // 获取版本列表
    const versionsRes = await getModVersions(modId as string, false)
    // 默认按发布时间降序排序，新版本在顶部
    versionList.value = versionsRes.data.list.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  } catch (error) {
    ElMessage.error('获取模组详情失败')
  } finally {
    loading.value = false
  }
}

const handleApprove = async () => {
  try {
    if (!modDetail.value) return
    await updateModAPI(modDetail.value.ID, {
      content: modDetail.value.content,
      description: modDetail.value.description,
      status: 'enable'
    })
    ElMessage.success('审核通过')
    fetchModDetail()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleReject = async () => {
  try {
    if (!modDetail.value) return
    await updateModAPI(modDetail.value.ID, {
      content: modDetail.value.content,
      description: modDetail.value.description,
      status: 'disable'
    })
    ElMessage.success('已拒绝')
    fetchModDetail()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleDownload = async (version: ModVersion) => {
  try {
    await updateCount(modId as string, version.id)
    window.open(version.file.url, '_blank')
    ElMessage.success('开始下载')
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

const handleDeleteVersion = async (version: ModVersion) => {
  try {
    await ElMessageBox.confirm(
      '确认删除该版本？删除后无法恢复。',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    await deleteModVersion(version.id)
    ElMessage.success('删除成功')
    fetchModDetail()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleVersionSort = ({ prop, order }: { prop: string; order: string }) => {
  if (!versionList.value) return
  const orderMultiplier = order === 'ascending' ? 1 : -1

  versionList.value.sort((a, b) => {
    if (prop === 'downloads') {
      return (a.downloads - b.downloads) * orderMultiplier
    } else if (prop === 'created_at') {
      return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * orderMultiplier
    }
    return 0
  })
}

const handleBack = () => {
  router.back()
}

onMounted(() => {
  fetchModDetail()
})
</script>

<template>
  <div class="mod-detail">
    <el-card v-loading="loading" class="main-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button class="back-button" link @click="handleBack">
              <el-icon>
                <ArrowLeft />
              </el-icon>返回
            </el-button>
            <div class="title-section">
              <h2 class="mod-title">{{ modDetail?.name }}</h2>
              <el-tag class="status-tag"
                :type="modDetail?.status === 'enable' ? 'success' : modDetail?.status === 'disable' ? 'danger' : 'warning'">
                {{ modDetail?.status === 'enable' ? '已通过' : modDetail?.status === 'disable' ? '未通过' : '待审核' }}
              </el-tag>
            </div>
          </div>
          <div class="header-actions">
            <div class="action-buttons" v-if="modDetail?.status !== 'enable'">
              <el-button size="small" type="success" @click="handleApprove">通过</el-button>
            </div>
            <div class="action-buttons" v-if="modDetail?.status !== 'disable'">
              <el-button size="small" type="danger" @click="handleReject">拒绝</el-button>
            </div>
          </div>
        </div>
      </template>

      <div class="mod-content">
        <div class="mod-cover" v-if="modDetail?.cover_file">
          <el-image :src="modDetail.cover_file.url" fit="cover" />
        </div>

        <div class="mod-info">
          <div class="info-grid">
            <div class="info-item">
              <el-icon>
                <Monitor />
              </el-icon>
              <span class="label">游戏：</span>
              <span>{{ modDetail?.game.name.split('|')[0] }}</span>
            </div>
            <div class="info-item">
              <el-icon>
                <Folder />
              </el-icon>
              <span class="label">分类：</span>
              <span>{{ modDetail?.category }}</span>
            </div>
            <div class="info-item">
              <el-icon>
                <User />
              </el-icon>
              <span class="label">作者：</span>
              <span>{{ modDetail?.user.user_name }}</span>
            </div>
            <div class="info-item">
              <el-icon>
                <Download />
              </el-icon>
              <span class="label">下载量：</span>
              <span>{{ modDetail?.total_downloads }}</span>
            </div>
            <div class="info-item">
              <el-icon>
                <Calendar />
              </el-icon>
              <span class="label">创建时间：</span>
              <span>{{ modDetail?.CreatedAt ? format(modDetail.CreatedAt, 'yyyy-MM-dd HH:mm') : '-' }}</span>
            </div>
          </div>

          <div class="mod-description">
            <h3>模组描述</h3>
            <p>{{ modDetail?.description }}</p>
          </div>
        </div>
      </div>

      <el-tabs v-model="activeTab" class="mod-tabs">
        <el-tab-pane label="模组内容" name="content">
          <div v-if="contentHtml" class="content-preview" v-html="contentHtml"></div>
          <div v-else class="content-empty">暂无内容</div>
        </el-tab-pane>
        <el-tab-pane label="版本列表" name="versions">
          <el-table :data="versionList" style="width: 100%" @sort-change="handleVersionSort">
            <el-table-column prop="version" label="版本号" width="120" />
            <el-table-column prop="change_log" label="更新日志" min-width="300" show-overflow-tooltip />
            <el-table-column prop="downloads" label="下载量" width="100" align="center" sortable="custom" />
            <el-table-column prop="created_at" label="发布时间" width="180" sortable="custom"
              :sort-orders="['ascending', 'descending', null]"
              :default-sort="{ prop: 'created_at', order: 'descending' }">
              <template #default="{ row }">
                {{ format(row.created_at, 'yyyy-MM-dd HH:mm') }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" @click="handleDownload(row)">
                  <el-icon>
                    <Download />
                  </el-icon>下载
                </el-button>
                <el-button size="small" type="danger" @click="handleDeleteVersion(row)">
                  <el-icon>
                    <Delete />
                  </el-icon>删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped>
.mod-detail {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.main-card {
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-button {
  font-size: 14px;
  color: #909399;
  transition: color 0.3s;
  padding: 0;
}

.back-button:hover {
  color: #409EFF;
}

.back-button .el-icon {
  margin-right: 4px;
  font-size: 16px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mod-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.status-tag {
  font-weight: 500;
}

.mod-content {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  padding: 0 20px;
}

.mod-cover {
  flex: 0 0 200px;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  background-color: #fff;
  padding: 8px;
}

.mod-cover :deep(.el-image) {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 4px;
}

.mod-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.info-item:hover {
  background-color: #f5f7fa;
}

.info-item .el-icon {
  font-size: 18px;
  color: #409EFF;
}

.label {
  color: #909399;
  font-weight: 500;
  min-width: 70px;
}

.mod-description {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.mod-description h3 {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.mod-description h3::before {
  content: '';
  width: 4px;
  height: 16px;
  background-color: #409EFF;
  border-radius: 2px;
}

.mod-description p {
  margin: 0;
  color: #606266;
  line-height: 1.8;
  font-size: 14px;
  text-align: justify;
}

.mod-tabs {
  margin: 0 20px;
  margin-top: 24px;
}

:deep(.el-tabs__nav-wrap) {
  background-color: #fff;
  padding: 0 16px;
  border-radius: 8px 8px 0 0;
  margin-bottom: 0 !important;
}

:deep(.el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.el-tabs__item) {
  font-size: 15px;
  height: 48px;
  line-height: 48px;
}

:deep(.el-tabs__active-bar) {
  height: 3px;
  border-radius: 1.5px;
}

.content-preview {
  padding: 24px;
  background-color: #fff;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.content-empty {
  padding: 40px;
  text-align: center;
  color: #909399;
  background-color: #fff;
  border-radius: 8px;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

:deep(.el-table th) {
  background-color: #f5f7fa !important;
  font-weight: 600;
  color: #303133;
}

:deep(.el-table td) {
  color: #606266;
}

.content-preview :deep(h2) {
  margin: 24px 0 16px;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.content-preview :deep(h2:first-child) {
  margin-top: 0;
}

.content-preview :deep(p) {
  line-height: 1.8;
  color: #606266;
  margin: 16px 0;
  text-align: justify;
}

.content-preview :deep(ul) {
  padding-left: 24px;
  color: #606266;
  margin: 16px 0;
}

.content-preview :deep(li) {
  margin-bottom: 12px;
  line-height: 1.6;
}

:deep(.el-button) {
  border-radius: 4px;
}

:deep(.el-button--small) {
  padding: 8px 16px;
}

:deep(.el-button--primary) {
  --el-button-hover-bg-color: #66b1ff;
}

:deep(.el-button .el-icon) {
  margin-right: 4px;
}
</style>