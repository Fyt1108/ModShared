import axiosInstance from "."
import { CommentList, CommentRequest } from "../types/comment"

export const getCommentsAPI = async (modID: string, _refresh: boolean): Promise<ApiResponse<CommentList>> => {
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