<script setup lang="ts">
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { removeToken } from '../utils/token'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)

// 注册所有图标
const icons = ElementPlusIconsVue

// 头像相关
const avatarUrl = ref('')
const avatarUploadRef = ref()
const avatarDialogVisible = ref(false)

const handleAvatarSuccess = (response: any) => {
  avatarUrl.value = response.url
  ElMessage.success('头像上传成功')
  avatarDialogVisible.value = false
}

const beforeAvatarUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('头像只能是 JPG/PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}

// 修改密码相关
const passwordDialogVisible = ref(false)
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const passwordFormRef = ref<FormInstance>()

const validatePass = (rule: any, value: string, callback: Function) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (passwordForm.value.confirmPassword !== '') {
      passwordFormRef.value?.validateField('confirmPassword')
    }
    callback()
  }
}

const validatePass2 = (rule: any, value: string, callback: Function) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== passwordForm.value.newPassword) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const passwordRules = ref<FormRules>({
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  newPassword: [
    { validator: validatePass, trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validatePass2, trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
})

const handlePasswordSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      // TODO: 实现修改密码逻辑
      ElMessage.success('密码修改成功')
      passwordDialogVisible.value = false
      passwordForm.value = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  })
}

// 语言切换相关
const handleSwitchLang = (lang: string) => {
  localStorage.setItem('language', lang)
  window.location.reload()
}

const handleCommand = (command: string) => {
  if (command === 'logout') {
    removeToken()
    // 清除记住的用户名和密码
    localStorage.removeItem('savedUsername')
    localStorage.removeItem('savedPassword')
    localStorage.removeItem('rememberPassword')
    router.push('/login')
    ElMessage.success('已退出登录')
  } else if (command === 'zh' || command === 'en') {
    handleSwitchLang(command)
  } else if (command === 'settings') {
    router.push('/settings')
  } else if (command === 'avatar') {
    avatarDialogVisible.value = true
  } else if (command === 'password') {
    passwordDialogVisible.value = true
  }
}

const handleLanguageCommand = (command: string) => {
  handleSwitchLang(command)
}
</script>

<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="aside">
      <div class="logo">
        <span class="logo-text">
          <span class="primary-text">Mod</span>
          <span class="secondary-text">Verse</span>
        </span>
      </div>
      <el-menu :default-active="route.path" :collapse="isCollapse" :router="true" class="menu">
        <el-menu-item index="/dashboard" class="menu-item">
          <el-icon>
            <DataBoard />
          </el-icon>
          <template #title>
            <span>仪表盘</span>
          </template>
        </el-menu-item>
        <el-menu-item index="/user" class="menu-item">
          <el-icon>
            <User />
          </el-icon>
          <template #title>
            <span>用户管理</span>
          </template>
        </el-menu-item>
        <el-menu-item index="/mod" class="menu-item">
          <el-icon>
            <Box />
          </el-icon>
          <template #title>
            <span>模组审核</span>
          </template>
        </el-menu-item>
        <el-menu-item index="/game" class="menu-item">
          <el-icon>
            <Monitor />
          </el-icon>
          <template #title>
            <span>游戏管理</span>
          </template>
        </el-menu-item>
        <el-menu-item index="/category" class="menu-item">
          <el-icon>
            <FolderOpened />
          </el-icon>
          <template #title>
            <span>分类管理</span>
          </template>
        </el-menu-item>
        <el-menu-item index="/comment" class="menu-item">
          <el-icon>
            <ChatDotRound />
          </el-icon>
          <template #title>
            <span>评论管理</span>
          </template>
        </el-menu-item>
        <el-menu-item index="/report" class="menu-item">
          <el-icon>
            <Warning />
          </el-icon>
          <template #title>
            <span>举报管理</span>
          </template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container class="main-container">
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
            <Expand v-if="isCollapse" />
            <Fold v-else />
          </el-icon>
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand" class="user-dropdown">
            <div class="user-info">
              <el-avatar :size="32" class="user-avatar" :src="avatarUrl">A</el-avatar>
              <span class="username">Admin</span>
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="settings">
                  <el-icon>
                    <Setting />
                  </el-icon>个人设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon>
                    <SwitchButton />
                  </el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>

    <!-- 修改头像对话框 -->
    <el-dialog v-model="avatarDialogVisible" title="修改头像" width="400px">
      <el-upload ref="avatarUploadRef" class="avatar-uploader" action="/api/upload/avatar" :show-file-list="false"
        :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
        <img v-if="avatarUrl" :src="avatarUrl" class="avatar" />
        <el-icon v-else class="avatar-uploader-icon">
          <Plus />
        </el-icon>
      </el-upload>
      <div class="upload-tip">支持 JPG/PNG 格式，大小不超过 2MB</div>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="400px">
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password placeholder="请输入原密码" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handlePasswordSubmit(passwordFormRef)">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </el-container>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

#app {
  width: 100%;
  height: 100%;
}
</style>

<style scoped>
.layout-container {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.aside {
  height: 100%;
  background-color: #1f2d3d;
  transition: width 0.3s;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
  z-index: 10;
  overflow-x: hidden;
  overflow-y: auto;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #1a2634;
}

.logo-text {
  font-size: 24px;
  font-weight: bold;
  white-space: nowrap;
}

.primary-text {
  color: #409EFF;
}

.secondary-text {
  color: #fff;
  opacity: 0.8;
}

.main-container {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  margin-right: 20px;
  color: #666;
  transition: color 0.3s;
}

.collapse-btn:hover {
  color: #409EFF;
}

.breadcrumb {
  margin-left: 8px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 0 8px;
}

.user-avatar {
  background-color: #409EFF;
  margin-right: 8px;
}

.username {
  font-size: 14px;
  margin: 0 8px;
  color: #666;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f0f2f5;
  min-width: 900px;
}

.menu-item {
  transition: all 0.3s;
}

.menu-item:hover {
  background-color: #263445 !important;
  color: white;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 240px;
}

.el-menu {
  border-right: none;
  height: calc(100% - 60px);
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.avatar-uploader {
  text-align: center;
}

.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}

:deep(.el-table__body-wrapper) {
  overflow-x: auto !important;
}

:deep(.el-dialog) {
  margin: 15vh auto 0 !important;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

.language-item {
  position: relative;
}

.language-item:hover .language-submenu {
  display: block;
}

.language-trigger {
  display: flex;
  align-items: center;
  padding: 5px 12px;
}

.arrow-icon {
  margin-left: auto;
}

.language-submenu {
  display: none;
  position: absolute;
  left: -150px;
  top: 0;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
  padding: 5px 0;
  min-width: 120px;
}

.submenu-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
}

.submenu-item:hover {
  background-color: #f5f7fa;
  color: #409EFF;
}

:deep(.el-dropdown-menu__item.language-item:hover) {
  background-color: transparent !important;
  color: inherit !important;
}

:deep(.el-dropdown-menu__item.language-item) {
  padding: 0 !important;
  background-color: transparent !important;
}
</style>