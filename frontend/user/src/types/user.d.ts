import { StorageFileSimple } from "./file"
import { ModSimple } from "./mod"

export type User = {
    created_at: string
    id: number
    profile_id: number
    role: string
    user_profile: UserProfile
    user_name: string
    ID: number
}

export type UserWithMod = {
    created_at: string
    id: number
    mod: ModSimple[]
    role: string
    user_profile: UserProfile
    user_name: string
}

export type UserProfile = {
    avatar_file: StorageFileSimple
    avatar_id: number
    description: string
    id: number
}

export type UpdateUserProfileRequest = {
    old_avatar_id: number
    new_avatar_id: number
    description: string
}