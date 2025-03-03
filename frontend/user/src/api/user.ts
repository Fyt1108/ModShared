import axiosInstance from ".";
import { UpdateUserProfileRequest, User, UserWithMod } from "../types/user";

export const getUserAPI = async (id: number): Promise<ApiResponse<User>> => {
    return await axiosInstance.get(`/user/${id}`)
}

export const getUserBySelfAPI = async (): Promise<ApiResponse<User>> => {
    return await axiosInstance.get("/user/my/profile")
}


export const getUserWithModAPI = async (id: number): Promise<ApiResponse<UserWithMod>> => {
    return await axiosInstance.get(`/user/${id}?withMod=true`)
}

export const getUserBySelfWithModAPI = async (): Promise<ApiResponse<UserWithMod>> => {
    return await axiosInstance.get("/user/my/profile?withMod=true")
}

export const getUserByNameWithModAPI = async (name: string): Promise<ApiResponse<UserWithMod>> => {
    return await axiosInstance.get(`/user/name/${name}`)
}

export const updateUserProfileAPI = async (data: UpdateUserProfileRequest): Promise<ApiResponse<null>> => {
    return await axiosInstance.put("/user/profile", {
        ...data
    })
}

export const deleteUserAPI = async (id: number): Promise<ApiResponse<null>> => {
    return await axiosInstance.delete(`/user/${id}`)
}