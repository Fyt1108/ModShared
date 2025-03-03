import axiosInstance from "."

export const likeMod = async (modID: string): Promise<ApiResponse<null>> => {
    return await axiosInstance.post(`/mod/${modID}/likes`)
}

export const unlikeMod = async (modID: string): Promise<ApiResponse<null>> => {
    return await axiosInstance.delete(`/mod/${modID}/likes`)
}

export const getLikeStatus = async (modID: string, _reload: boolean): Promise<ApiResponse<boolean>> => {
    return await axiosInstance.get(`/mod/${modID}/likes`)
}