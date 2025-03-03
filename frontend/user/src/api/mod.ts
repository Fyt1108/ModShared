import { query } from "@solidjs/router"
import axiosInstance from "."
import { CreateModRequest, Mod, ModList, ModQuery, updateModRequest } from "../types/mod"

export const createModAPI = async (c: CreateModRequest): Promise<ApiResponse<null>> => {
    return await axiosInstance.post("/mod", { ...c })
}

export const getModsAPI = query(async (query: ModQuery, _reload: boolean): Promise<ApiResponse<ModList>> => {
    return await axiosInstance.get('/mod', { params: { ...query } })
}, "modQuery")

export const getModAPI = async (id: string): Promise<ApiResponse<Mod>> => {
    return await axiosInstance.get(`/mod/${id}`)
}

export const deleteModAPI = async (id: number): Promise<ApiResponse<null>> => {
    return await axiosInstance.delete(`/mod/${id}`)
}

export const updateModAPI = async (id: number, c: updateModRequest): Promise<ApiResponse<null>> => {
    return await axiosInstance.put(`/mod/${id}`, { ...c })
}