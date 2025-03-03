import { DownloadFile } from "./file"

export type ModVersionList = {
    list: ModVersion[]
    total: number
}

export type ModVersion = {
    change_log: string
    created_at: string
    downloads: number
    file: DownloadFile
    id: number
    version: string
}

export type CreateModVersionRequest = {
    mod_id: number
    version: string
    change_log: string
    file_id: number
}