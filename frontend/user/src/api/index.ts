import axios from "axios"
import { useAuthStore } from "../stores/auth"
import { getToken, setRefreshToken, setToken } from "../utils/token"
import { isRefreshRequest, refreshTokenAPI } from "./auth"

export const apiUrl = 'http://127.0.0.1:3000/api'
// 创建axios实例
const axiosInstance = axios.create({
    baseURL: apiUrl,
    timeout: 10000,
})

// 添加请求拦截器
axiosInstance.interceptors.request.use(
    (config) => {
        if (config.url?.startsWith('auth/refresh_token/')) {
            return config
        }
        config.headers.Authorization = getToken() ? `Bearer ${getToken()}` : ""
        return config
    },
    (error) => {
        return Promise.reject(error)
    })

// 添加响应拦截器
axiosInstance.interceptors.response.use(
    async (res) => {
        if (res.headers.authorization) {
            const token = res.headers.authorization.replace('Bearer ', '')
            setToken(token)
            axiosInstance.defaults.headers.Authorization = `Bearer ${token}`
        }

        if (res.headers.refreshtoken) {
            const refreshtoken = res.headers.refreshtoken.replace('Bearer ', '')
            setRefreshToken(refreshtoken)
        }
        return res.data
    },

    async (error) => {
        if (error.response) {
            if (error.response.data.code === 6 && !isRefreshRequest(error.config)) {
                //刷新token
                const isSuccess = await refreshTokenAPI()
                if (isSuccess) {
                    //设置登录状态
                    useAuthStore().setIsLogin(true)
                    //重新请求
                    error.config.headers.Authorization = `Bearer ${getToken()}`
                    const resp = await axiosInstance.request(error.config)
                    return resp
                } else {
                    useAuthStore().logout()
                }
            }
        }
        return Promise.reject(error)
    }
)

export default axiosInstance