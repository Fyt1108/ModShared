<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { loginAdminAPI } from '../../api/auth'
import { setToken } from '../../utils/token'

const { t } = useI18n()
const router = useRouter()

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const loginFormRef = ref<FormInstance>()
const loading = ref(false)

// 保存用户凭据
const saveCredentials = () => {
  if (loginForm.remember) {
    localStorage.setItem('savedUsername', loginForm.username)
    localStorage.setItem('savedPassword', window.btoa(loginForm.password)) // 简单加密
    localStorage.setItem('rememberPassword', 'true')
  } else {
    localStorage.removeItem('savedUsername')
    localStorage.removeItem('savedPassword')
    localStorage.removeItem('rememberPassword')
  }
}

// 读取保存的用户凭据
const loadCredentials = () => {
  const remembered = localStorage.getItem('rememberPassword') === 'true'
  if (remembered) {
    loginForm.username = localStorage.getItem('savedUsername') || ''
    loginForm.password = window.atob(localStorage.getItem('savedPassword') || '') // 解密
    loginForm.remember = true
  }
}

// 页面加载时读取保存的凭据
onMounted(() => {
  loadCredentials()
})

const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
})

const handleLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await loginAdminAPI({
          username: loginForm.username,
          password: loginForm.password,
        })
        setToken(res.data)
        // 保存或清除用户凭据
        saveCredentials()
        ElMessage.success('登录成功')
        router.push('/')
      } catch (error) {
        ElMessage.error('登录失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-header">
        <h1 class="logo-text">
          <span class="primary-text">Mod</span>
          <span class="secondary-text">Verse</span>
        </h1>
        <p class="welcome-text">欢迎使用ModVerse后台管理系统</p>
      </div>
      <el-card class="login-card" shadow="never">
        <template #header>
          <h2 class="form-title">{{ t('login.title') }}</h2>
        </template>
        <el-form ref="loginFormRef" :model="loginForm" :rules="rules" label-width="0" size="large"
          @keyup.enter="handleLogin(loginFormRef)">
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" :placeholder="t('login.username')" prefix-icon="User"
              autocomplete="off" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" type="password" :placeholder="t('login.password')" prefix-icon="Lock"
              show-password autocomplete="off" />
          </el-form-item>
          <el-form-item>
            <div class="form-options">
              <el-checkbox v-model="loginForm.remember">
                {{ t('login.remember') }}
              </el-checkbox>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="login-button" :loading="loading" @click="handleLogin(loginFormRef)">
              {{ t('login.login') }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
      <div class="login-footer">
        <p>Copyright © 2024 ModVerse. All Rights Reserved.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1f2d3d 0%, #121920 100%);
  position: fixed;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 1500"><rect fill="%23ffffff" width="2000" height="1500"/><defs><circle stroke="%23ffffff" vector-effect="non-scaling-stroke" id="a" fill="none" stroke-width="5" r="315"/></defs><g style="transform-origin:center"><g transform="rotate(60 0 0)" style="transform-origin:center"><circle fill="%23ffffff" style="opacity:0.03" cx="0" cy="0" r="2000"/><circle fill="%23ffffff" style="opacity:0.05" cx="0" cy="0" r="1800"/><circle fill="%23ffffff" style="opacity:0.05" cx="0" cy="0" r="1700"/><circle fill="%23ffffff" style="opacity:0.05" cx="0" cy="0" r="1651"/><circle fill="%23ffffff" style="opacity:0.05" cx="0" cy="0" r="1450"/><circle fill="%23ffffff" style="opacity:0.05" cx="0" cy="0" r="1250"/><circle fill="%23ffffff" style="opacity:0.05" cx="0" cy="0" r="1175"/><circle fill="%23ffffff" style="opacity:0.05" cx="0" cy="0" r="900"/><circle fill="%23ffffff" style="opacity:0.05" cx="0" cy="0" r="750"/><circle fill="%23ffffff" style="opacity:0.05" cx="0" cy="0" r="500"/><circle fill="%23ffffff" style="opacity:0.05" cx="0" cy="0" r="380"/><circle fill="%23ffffff" style="opacity:0.05" cx="0" cy="0" r="250"/></g></g></svg>');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  opacity: 0.1;
}

.login-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  padding: 0 20px;
  margin: 0 auto;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-text {
  font-size: 36px;
  font-weight: bold;
  margin: 0 0 16px;
}

.primary-text {
  color: #409EFF;
}

.secondary-text {
  color: #fff;
}

.welcome-text {
  color: #fff;
  opacity: 0.8;
  font-size: 16px;
  margin: 0;
}

.login-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.form-title {
  font-size: 24px;
  color: #1f2d3d;
  text-align: center;
  margin: 0;
  font-weight: 500;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
}

.login-footer {
  text-align: center;
  margin-top: 40px;
  color: #fff;
  opacity: 0.6;
  font-size: 14px;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #409EFF inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409EFF inset !important;
}

:deep(.el-card__header) {
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
</style>