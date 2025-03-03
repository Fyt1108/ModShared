import { type StorageFileSimple } from "./file"

export type Game = {
    id: number
    logo_file: StorageFileSimple
    logo_id: number
    mod_nums: number
    name: string
    publishers: string
    developers: string
    release_time: string
}

export type GameList = {
    list: Game[]
    total: number
}

export type GameQuery = {
    name?: string
    developers?: string
    publishers?: string
} & Paging

export type CreateGameRequest = {
    name: string
    logo_id: number
    publishers: string
    developers: string
    release_time: string
}

export type UpdateGameRequest = {
    name: string
    old_logo_id: number
    new_logo_id: number
    publishers: string
    developers: string
    release_time: string
}