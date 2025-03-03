import axiosInstance from "."
import type { CreateGameRequest, GameList, GameQuery, UpdateGameRequest } from "../types/game"

export const getGamesAPI = async (query: GameQuery): Promise<ApiResponse<GameList>> => {
    return await axiosInstance.get('/game', { params: { ...query } })
}

export const updateGameAPI = async (id: number, data: UpdateGameRequest): Promise<ApiResponse<null>> => {
    return await axiosInstance.put(`/game/${id}`, { ...data })
}

export const deleteGameAPI = async (id: number): Promise<ApiResponse<null>> => {
    return await axiosInstance.delete(`/game/${id}`)
}

export const createGameAPI = async (data: CreateGameRequest): Promise<ApiResponse<null>> => {
    return await axiosInstance.post('/game', { ...data })
}