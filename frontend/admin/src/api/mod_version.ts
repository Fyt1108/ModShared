import axiosInstance from ".";
import type { CreateModVersionRequest, ModVersionList } from "../types/mod_version";

export const getModVersions = async (modID: string, _reload: boolean): Promise<ApiResponse<ModVersionList>> => {
    return await axiosInstance.get(`/mod_version/${modID}`)
}

export const createModVersion = async (modVersion: CreateModVersionRequest): Promise<ApiResponse<null>> => {
    return await axiosInstance.post(`/mod_version`, {
        ...modVersion
    })
}

export const updateCount = async (modID: string, id: number): Promise<ApiResponse<null>> => {
    return await axiosInstance.post(`/mod_version/count/${modID}/${id}`)
}

export const deleteModVersion = async (id: number): Promise<ApiResponse<null>> => {
    return await axiosInstance.delete(`/mod_version/${id}`)
}