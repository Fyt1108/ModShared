import axiosInstance from ".";
import { ModFavoriteList, ModFavoriteQuery } from "../types/mod_favorite";

export const CreateModFavoriteAPI = async (modID: number): Promise<ApiResponse<null>> => {
    return await axiosInstance.post("/mod-favorite", {
        mod_id: modID
    })
}

export const DeleteModFavoriteAPI = async (modID: number): Promise<ApiResponse<null>> => {
    return await axiosInstance.delete(`/mod_favorite/${modID}`)
}

export const GetModFavoritesAPI = async (query: ModFavoriteQuery, _reload: boolean): Promise<ApiResponse<ModFavoriteList>> => {
    return await axiosInstance.get("/mod_favorite", {
        params: {
            ...query
        }
    })
}

export const CheckIsFavoriteAPI = async (modID: number, _reload: boolean): Promise<ApiResponse<boolean>> => {
    return await axiosInstance.get(`/mod_favorite/check?mod_id=${modID}`)
}