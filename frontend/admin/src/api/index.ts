import axios from "axios"
import { getToken } from "../utils/token"

export const apiUrl = 'http://127.0.0.1:3000/api'
// 创建axios实例
const axiosInstance = axios.create({
    baseURL: apiUrl,
    timeout: 10000,
})

// 添加请求拦截器
axiosInstance.interceptors.request.use(
    (config) => {
        config.headers.Authorization = getToken() ? `${getToken()}` : ""
        return config
    },
    (error) => {
        return Promise.reject(error)
    })

// 添加响应拦截器
axiosInstance.interceptors.response.use(
    async (res) => {
        return res.data
    },
)

export default axiosInstance