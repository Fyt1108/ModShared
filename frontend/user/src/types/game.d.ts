import { StorageFile } from "./file"

export type Game = {
    id: number
    logo_file: StorageFile
    logo_id: number
    mod_nums: number
    name: string
}

export type GameList = {
    list: Game[]
    total: number
}

export type GameQuery = {
    name?: string
} & Paging