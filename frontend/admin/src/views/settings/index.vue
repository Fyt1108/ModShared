<script setup lang="ts">
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'

// 头像相关
const avatarUrl = ref('')
const cropperRef = ref<HTMLImageElement>()
const cropperInstance = ref<Cropper>()
const cropperVisible = ref(false)
const previewUrl = ref('')

const handleAvatarSuccess = (response: any) => {
    avatarUrl.value = response.url
    ElMessage.success('头像上传成功')
}

const beforeAvatarUpload = (file: File) => {
    const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
    const isLt2M = file.size / 1024 / 1024 < 2

    if (!isJPG) {
        ElMessage.error('头像只能是 JPG/PNG 格式!')
        return false
    }
    if (!isLt2M) {
        ElMessage.error('头像大小不能超过 2MB!')
        return false
    }

    // 预览图片
    const reader = new FileReader()
    reader.onload = (e) => {
        previewUrl.value = e.target?.result as string
        cropperVisible.value = true
        // 在下一个 tick 初始化 cropper
        setTimeout(() => {
            if (cropperRef.value) {
                if (cropperInstance.value) {
                    cropperInstance.value.destroy()
                }
                cropperInstance.value = new Cropper(cropperRef.value, {
                    aspectRatio: 1,
                    viewMode: 1,
                    dragMode: 'move',
                    autoCropArea: 1,
                    restore: false,
                    modal: false,
                    guides: false,
                    highlight: false,
                    cropBoxMovable: false,
                    cropBoxResizable: false,
                    toggleDragModeOnDblclick: false,
                })
            }
        })
    }
    reader.readAsDataURL(file)
    return false // 阻止自动上传
}

const handleCropConfirm = () => {
    if (cropperInstance.value) {
        const canvas = cropperInstance.value.getCroppedCanvas({
            width: 200,
            height: 200
        })
        avatarUrl.value = canvas.toDataURL()
        cropperVisible.value = false
        ElMessage.success('头像更新成功')
        // TODO: 将 base64 转换为文件并上传
    }
}

const handleCropCancel = () => {
    cropperVisible.value = false
    previewUrl.value = ''
    if (cropperInstance.value) {
        cropperInstance.value.destroy()
    }
}

// 修改密码相关
const passwordForm = ref({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
})
const passwordFormRef = ref<FormInstance>()
const passwordDialogVisible = ref(false)

const validatePass = (_rule: any, value: string, callback: Function) => {
    if (value === '') {
        callback(new Error('请输入密码'))
    } else {
        if (passwordForm.value.confirmPassword !== '') {
            passwordFormRef.value?.validateField('confirmPassword')
        }
        callback()
    }
}

const validatePass2 = (_rule: any, value: string, callback: Function) => {
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
            ElMessage.success('密码修改成功')
            passwordForm.value = {
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            }
            passwordDialogVisible.value = false
        }
    })
}
</script>

<template>
    <div class="settings-container">
        <el-row :gutter="20" justify="center">
            <el-col :span="16">
                <el-card shadow="never" class="settings-card">
                    <template #header>
                        <div class="card-header">
                            <span class="header-title">个人设置</span>
                        </div>
                    </template>

                    <div class="settings-content">
                        <div class="avatar-section">
                            <div class="avatar-preview">
                                <el-avatar :size="120" :src="avatarUrl" class="preview-avatar">
                                    <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
                                </el-avatar>
                                <div class="avatar-actions">
                                    <el-upload class="avatar-uploader" action="/api/upload/avatar"
                                        :show-file-list="false" :on-success="handleAvatarSuccess"
                                        :before-upload="beforeAvatarUpload" :auto-upload="false">
                                        <el-button type="primary" class="upload-btn">
                                            <el-icon class="el-icon--left">
                                                <Upload />
                                            </el-icon>更换头像
                                        </el-button>
                                    </el-upload>
                                    <p class="upload-tip">支持 JPG、PNG 格式，大小不超过 2MB</p>
                                </div>
                            </div>
                        </div>

                        <el-divider>账号安全</el-divider>

                        <div class="security-section">
                            <div class="security-item" @click="passwordDialogVisible = true">
                                <div class="security-info">
                                    <el-icon size="24" class="security-icon">
                                        <Lock />
                                    </el-icon>
                                    <div class="security-text">
                                        <h4>登录密码</h4>
                                        <p>定期更换密码可以保护账号安全</p>
                                    </div>
                                </div>
                                <el-icon class="arrow-icon">
                                    <ArrowRight />
                                </el-icon>
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 裁剪对话框 -->
        <el-dialog v-model="cropperVisible" title="裁剪头像" width="600px" :close-on-click-modal="false" destroy-on-close>
            <div class="cropper-container">
                <img ref="cropperRef" :src="previewUrl" style="max-width: 100%;" />
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="handleCropCancel">取消</el-button>
                    <el-button type="primary" @click="handleCropConfirm">确定</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 修改密码对话框 -->
        <el-dialog v-model="passwordDialogVisible" title="修改密码" width="500px">
            <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px"
                class="password-form">
                <el-form-item label="原密码" prop="oldPassword">
                    <el-input v-model="passwordForm.oldPassword" type="password" show-password placeholder="请输入原密码" />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                    <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码" />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input v-model="passwordForm.confirmPassword" type="password" show-password
                        placeholder="请再次输入新密码" />
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
    </div>
</template>

<style scoped>
.settings-container {
    padding: 20px;
    background-color: var(--el-bg-color-page);
    min-height: calc(100vh - 60px);
}

.settings-card {
    background-color: var(--el-bg-color);
}

.card-header {
    display: flex;
    align-items: center;
}

.header-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--el-text-color-primary);
}

.settings-content {
    padding: 20px 0;
}

.avatar-section {
    display: flex;
    justify-content: center;
    padding: 20px 0;
}

.avatar-preview {
    text-align: center;
}

.preview-avatar {
    border: 4px solid var(--el-color-primary-light-8);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.preview-avatar:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.avatar-actions {
    margin-top: 20px;
    text-align: center;
}

.upload-btn {
    margin-bottom: 8px;
}

.upload-tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin: 8px 0 0;
}

.security-section {
    padding: 0 20px;
}

.security-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-radius: 8px;
    background-color: var(--el-bg-color-page);
    cursor: pointer;
    transition: all 0.3s ease;
}

.security-item:hover {
    background-color: var(--el-color-primary-light-9);
    transform: translateY(-2px);
}

.security-info {
    display: flex;
    align-items: center;
    gap: 16px;
}

.security-icon {
    color: var(--el-color-primary);
}

.security-text h4 {
    margin: 0 0 4px;
    font-size: 16px;
    color: var(--el-text-color-primary);
}

.security-text p {
    margin: 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
}

.arrow-icon {
    color: var(--el-text-color-secondary);
    transition: transform 0.3s ease;
}

.security-item:hover .arrow-icon {
    transform: translateX(4px);
    color: var(--el-color-primary);
}

.cropper-container {
    height: 400px;
    background-color: #000;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.password-form {
    padding: 20px;
}

:deep(.el-upload) {
    display: block;
}

:deep(.el-upload-dragger) {
    width: auto;
}
</style>