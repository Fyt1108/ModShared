import axiosInstance from "."
import { CategoriesList, CategoriesQuery } from "../types/categories"


export const getCategoryAPI = async (query: CategoriesQuery): Promise<ApiResponse<CategoriesList>> => {
    return await axiosInstance.get("/categories", {
        params: {
            ...query
        }
    })
}
