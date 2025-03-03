type ApiResponse<T> = {
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