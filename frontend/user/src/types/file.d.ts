export type StorageFile = {
    CreatedAt: string
    DeletedAt: string
    file_key: string
    file_name: string
    file_size: number
    ID: number
    is_temp: boolean
    mime_type: string
    UpdatedAt: string
    url: string
    user_id: number
}

export type StorageFileSimple = {
    id: number
    url: string
}

export type DownloadFile = {
    file_name: string
    file_size: number
    id: number
    url: string
}