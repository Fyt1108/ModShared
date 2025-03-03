import axiosInstance from ".";
import type { ReportList, ReportQuery, UpdateReportRequest } from "../types/report";

export const getReportsAPI = async (query: ReportQuery): Promise<ApiResponse<ReportList>> => {
    return await axiosInstance.get("/report", {
        params: {
            ...query
        }
    });
}

export const deleteReportAPI = async (id: number): Promise<ApiResponse<null>> => {
    return await axiosInstance.delete(`/report/${id}`)
}

export const getReportAPI = async (id: number): Promise<ApiResponse<Report>> => {
    return await axiosInstance.get(`/report/${id}`)
}

export const updateReportAPI = async (id: number, data: UpdateReportRequest): Promise<ApiResponse<null>> => {
    return await axiosInstance.put(`/report/${id}`, { ...data })
}