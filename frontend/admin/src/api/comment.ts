import axiosInstance from "."
import type { CommentList, CommentRequest } from "../types/comment"
import type { UserQuery } from "../types/user"

export const getCommentsAPI = async (modID: string): Promise<ApiResponse<CommentList>> => {
    return await axiosInstance.get(`/comment/mod/${modID}`)
}

export const createCommentAPI = async (comment: CommentRequest): Promise<ApiResponse<null>> => {
    return await axiosInstance.post(`/comment`, {
        ...comment
    })
}

export const deleteCommentAPI = async (id: string): Promise<ApiResponse<null>> => {
    return await axiosInstance.delete(`/comment/${id}`)
}

export const getAllCommentsAPI = async (query: UserQuery): Promise<ApiResponse<CommentList>> => {
    return await axiosInstance.get(`/comment`, {
        params: {
            ...query
        }
    })
}

export const getCommentAPI = async (modID: string): Promise<ApiResponse<Comment>> => {
    return await axiosInstance.get(`/comment/${modID}`)
}