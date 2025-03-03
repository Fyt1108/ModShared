import axiosInstance from "."
import type { LoginRequest } from "../types/auth"

//登录请求接口
export const loginAdminAPI = async (l: LoginRequest): Promise<ApiResponse<string>> => {
    return await axiosInstance.post('auth/login/admin', { ...l })
}
