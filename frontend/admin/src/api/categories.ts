import axiosInstance from "."
import type { CategoriesList, CategoriesQuery, CreateCategories, UpdateCategories } from "../types/categories"

export const getCategoryAPI = async (query: CategoriesQuery): Promise<ApiResponse<CategoriesList>> => {
    return await axiosInstance.get("/categories", {
        params: {
            ...query
        }
    })
}

export const deleteCategoryAPI = async (id: number): Promise<ApiResponse<null>> => {
    return await axiosInstance.delete(`/categories/${id}`)
}

export const createCategoryAPI = async (categories: CreateCategories): Promise<ApiResponse<null>> => {
    return await axiosInstance.post("/categories", {
        ...categories
    })
}

export const updateCategoryAPI = async (id: number, categories: UpdateCategories): Promise<ApiResponse<null>> => {
    return await axiosInstance.put(`/categories/${id}`, {
        ...categories
    })
}
