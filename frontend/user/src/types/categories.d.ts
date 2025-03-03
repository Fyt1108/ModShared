export type Categories = {
    id: number
    name: string
    status: string
    created_at: string
}

export type CategoriesList = {
    list: Categories[]
    total: number
}

export type CreateCategories = {
    name: string
    status: string
}

export type UpdateCategories = {
    name: string
    status: string
}

export type CategoriesQuery = {
    name?: string
    status: string
} & Paging