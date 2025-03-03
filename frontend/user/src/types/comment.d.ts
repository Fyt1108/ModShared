import { User } from "./user";

type Comment = {
    content: string
    created_at: string
    id: number
    likes: number
    replies: Comment[]
    user: User
}

type CommentRequest = {
    content: string
    mod_id: number
    parent_id: number
}

type CommentList = {
    list: Comment[]
    total: number
}