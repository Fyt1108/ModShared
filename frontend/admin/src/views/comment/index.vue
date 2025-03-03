<script setup lang="ts">
import { format } from 'date-fns'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { deleteCommentAPI, getAllCommentsAPI, getCommentAPI } from '../../api/comment'
import type { Comment, CommentList } from '../../types/comment'

const route = useRoute()
const loading = ref(false)
const commentList = ref<CommentList>()

const query = ref({
    content: '',
    userName: '',
    id: route.query.id as string || '',
    page: 1,
    page_size: 10,
    sort: '',
    order: ''
})

const searchForm = ref({
    content: '',
    userName: '',
    id: route.query.id as string || ''
})

// 监听路由参数变化
watch(
    () => route.query.id,
    (newId) => {
        if (newId) {
            searchForm.value.id = newId as string
            handleSearch()
        }
    }
)

// 获取评论列表数据
const fetchData = async () => {
    loading.value = true
    try {
        // 如果有指定ID，则优先获取单个评论
        if (query.value.id) {
            const res = await getCommentAPI(query.value.id)
            if (res.code === 0 && res.data) {
                commentList.value = {
                    //@ts-ignore
                    list: [res.data],
                    total: 1
                }
            } else {
                commentList.value = {
                    list: [],
                    total: 0
                }
                ElMessage.warning('未找到指定评论')
            }
        } else {
            const res = await getAllCommentsAPI(query.value)
            if (res.code === 0) {
                commentList.value = res.data
            } else {
                ElMessage.error(res.error || '获取评论列表失败')
            }
        }
    } catch (error) {
        console.error('获取评论列表失败:', error)
        ElMessage.error('获取数据失败')
    } finally {
        loading.value = false
    }
}

const handleSearch = () => {
    query.value = {
        ...query.value,
        content: searchForm.value.content,
        userName: searchForm.value.userName,
        id: searchForm.value.id,
        page: 1
    }
    fetchData()
}

const handleReset = () => {
    searchForm.value = {
        content: '',
        userName: '',
        id: ''
    }
    query.value = {
        content: '',
        userName: '',
        id: '',
        page: 1,
        page_size: 10,
        sort: '',
        order: ''
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

const handleDelete = (row: Comment) => {
    ElMessageBox.confirm(
        '确认删除该评论？',
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(async () => {
        try {
            await deleteCommentAPI(String(row.id))
            ElMessage.success('删除成功')
            fetchData()
        } catch (error) {
            ElMessage.error('删除失败')
        }
    })
}

// 添加排序处理函数
const handleSort = ({ prop, order }: { prop: string; order: string }) => {
    const orderMap: Record<string, string> = {
        ascending: 'asc',
        descending: 'desc'
    }

    query.value.sort = prop
    query.value.order = order ? orderMap[order] : ''
    fetchData()
}

onMounted(() => {
    fetchData()
})
</script>

<template>
    <div class="comment-management">
        <!-- 搜索表单 -->
        <el-card class="search-card">
            <el-form :model="searchForm" inline>
                <el-form-item label="评论ID">
                    <el-input v-model="searchForm.id" placeholder="请输入评论ID" clearable type="number"
                        @keyup.enter="handleSearch" style="width: 120px;" />
                </el-form-item>
                <el-form-item label="评论内容">
                    <el-input v-model="searchForm.content" placeholder="请输入评论内容" clearable @keyup.enter="handleSearch"
                        style="width: 200px;" />
                </el-form-item>
                <el-form-item label="评论者">
                    <el-input v-model="searchForm.userName" placeholder="请输入评论者用户名" clearable
                        @keyup.enter="handleSearch" style="width: 150px;" />
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

        <!-- 评论列表 -->
        <el-card>
            <el-table v-loading="loading" :data="commentList?.list" style="width: 100%" border
                @sort-change="handleSort">
                <el-table-column type="index" label="#" width="60" align="center" />
                <el-table-column prop="id" label="评论ID" width="80" align="center" />
                <el-table-column prop="content" label="评论内容" min-width="400" show-overflow-tooltip />
                <el-table-column prop="user.user_name" label="评论者" width="120" align="center" show-overflow-tooltip />
                <el-table-column prop="created_at" label="评论时间" width="180" align="center" sortable="custom">
                    <template #default="{ row }">
                        {{ format(row.created_at, "yyyy-MM-dd HH:mm:ss") }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="120" fixed="right" align="center">
                    <template #default="{ row }">
                        <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination">
                <el-pagination v-model:current-page="query.page" v-model:page-size="query.page_size"
                    :page-sizes="[10, 20, 50, 100]" :total="commentList?.total || 0"
                    layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
                    @current-change="handleCurrentChange" />
            </div>
        </el-card>
    </div>
</template>

<style scoped>
.comment-management {
    padding: 20px;
    background-color: var(--el-bg-color-page);
    min-height: 100vh;
}

.search-card {
    margin-bottom: 20px;
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

:deep(.el-card__body) {
    padding: 20px;
}

:deep(.el-table) {
    margin-top: 10px;
}

:deep(.el-table .cell) {
    white-space: pre-wrap;
}
</style>