export type User = {
    created_at: string
    id: number
    role: string
    user_name: string
    last_login: string
    status: string
    email: string
}

export type UpdateUserState = {
    role: string
    status: string
}

export type UserList = {
    list: User[]
    total: number
}

export type UserQuery = {
    username?: string
    role?: string
    status?: string
    email?: string
} & Paging