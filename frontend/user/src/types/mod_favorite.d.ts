import { ModSimple } from "./mod"

export type ModFavorite = {
    mod_id: number
    mod: ModSimple
    created_at: string
}

export type ModFavoriteList = {
    list: ModFavorite[]
    total: number
}

export type ModFavoriteQuery = {
    name: string
    game_id: number
} & Paging