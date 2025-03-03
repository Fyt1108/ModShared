import { AxiosRequestConfig } from "axios"
import axiosInstance from "."
import { ChangePasswordRequest, LoginRequest, RegisterRequest, ResetPasswordRequest } from "../types/auth"
import { getRefreshToken } from "../utils/token"

//登录请求接口
export const loginAPI = async (l: LoginRequest): Promise<ApiResponse<null>> => {
    return await axiosInstance.post('auth/login/', { ...l })
}

//注册请求接口
export const registerAPI = async (r: RegisterRequest): Promise<ApiResponse<null>> => {
    return await axiosInstance.post('auth/register/', { ...r })
}

//获取验证码接口
let isVerify = false
export const verifyAPI = async (email: string): Promise<ApiResponse<null>> => {
    if (isVerify) {
        return {
            code: 1,
            data: null,
            error: '请勿频繁请求验证码'
        }
    }

    isVerify = true

    try {
        return await axiosInstance.post('/auth/verify', { email })
    } finally {
        setTimeout(() => {
            isVerify = false
        }, 60000)
    }
}

//刷新token接口
let promise: Promise<boolean> | null
export const refreshTokenAPI = async () => {
    // 检测是否有请求,防止重复请求
    if (promise) {
        return promise
    }

    promise = new Promise((resolve, reject) => {
        axiosInstance.get('auth/refresh_token/', {
            headers: {
                Authorization: `Bearer ${getRefreshToken()}`,
                isRefreshToken: true
            },
        }).then(resp => {
            //@ts-ignore
            resolve(resp.code === 0)
        }).catch(err => {
            reject(err)
        })
    })

    promise.finally(() => {
        promise = null
    })

    return promise
}

//检测是否为刷新token请求
export const isRefreshRequest = (config: AxiosRequestConfig): boolean => {
    return !!config.headers?.isRefreshToken
}

//发送重置密码邮件接口
let isSendEmail = false
export const sendResetEmailAPI = async (email: string): Promise<ApiResponse<null>> => {
    if (isSendEmail) {
        return {
            code: 1,
            data: null,
            error: '请勿频繁请求验证码'
        }
    }

    isSendEmail = true

    try {
        return await axiosInstance.post('auth/send_reset_email', { email })
    } finally {
        setTimeout(() => {
            isSendEmail = false
        }, 60000)
    }
}

//重置密码接口
export const resetPasswordAPI = async (r: ResetPasswordRequest): Promise<ApiResponse<null>> => {
    return await axiosInstance.put('auth/reset_password', { ...r })
}

export const isLoginAPI = async (): Promise<ApiResponse<boolean>> => {
    return await axiosInstance.get('auth/is_login')
}

export const updatePasswordAPI = async (r: ChangePasswordRequest): Promise<ApiResponse<null>> => {
    return await axiosInstance.put('auth/update_password', { ...r })
}

export const getCaptchaAPI = async (_reload: boolean): Promise<ApiResponse<Captcha>> => {
    return await axiosInstance.get('/captcha')
}