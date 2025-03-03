import { query } from "@solidjs/router"
import axiosInstance from "."
import { GameList, GameQuery } from "../types/game"

//使用query缓存，避免重复请求
export const getGamesAPI = query(async (query: GameQuery): Promise<ApiResponse<GameList>> => {
    return await axiosInstance.get('/game', { params: { ...query } })
}, "gameQuery")