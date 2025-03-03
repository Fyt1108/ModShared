type ApiResponse<T> = {
    res: Comment
    code: number
    data: T
    error: string
}

type Paging = {
    page?: number
    page_size?: number
    sort?: string
    order?: string
}