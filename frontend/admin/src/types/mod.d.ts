import { StorageFile, StorageFileSimple } from "./file"
import { Game } from "./game"
import { User } from "./user"

export type CreateModRequest = {
    name: string
    description: string
    content: any
    category: string
    game_id: number
    cover_id: number
    version: string
    file_id: number
}

export type ModQuery = {
    category?: string[]
    name?: string
    gameID?: number
    userID?: number
    status?: string
    userName?: string
} & Paging

export type Mods = {
    category: string;
    cover_file: StorageFileSimple
    cover_id: number
    description: string
    game: Game
    game_id: number
    id: number
    last_update: string
    likes: number
    name: string
    user: User
    total_downloads: number
    user_id: number
    status: string  // "pending" | "enable" | "disable"
    content: string
    created_at: string
}

export type ModList = {
    list: Mods[];
    total: number;
}

export type ModSimple = {
    cover_file: StorageFileSimple
    cover_id: number
    description: string
    category: string
    game: Game
    id: number
    likes: number
    name: string
    total_downloads: number
    last_update: string
}

export type Mod = {
    category: string
    content: string
    cover_file: StorageFile
    CreatedAt: string
    DeletedAt: null
    description: string
    game: Game
    ID: number
    last_update: string
    likes: number
    name: string
    status: string
    total_downloads: number
    UpdatedAt: string
    user: User
}

type updateModRequest = {
    content: string
    description: string
    status: string
}