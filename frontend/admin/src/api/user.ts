import axiosInstance from ".";
import type { UpdateUserState, UserList, UserQuery } from "../types/user";

export const getUsersAPI = async (query: UserQuery): Promise<ApiResponse<UserList>> => {
    return await axiosInstance.get("/user", {
        params: { ...query }
    })
}

export const deleteUserAPI = async (id: number): Promise<ApiResponse<null>> => {
    return await axiosInstance.delete(`/user/${id}`)
}

export const UpdateUserStateAPI = async (id: number, state: UpdateUserState): Promise<ApiResponse<null>> => {
    return await axiosInstance.put(`/user/state/${id}`, {
        ...state
    })
}