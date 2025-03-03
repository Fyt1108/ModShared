import axiosInstance from ".";
import { CreateReportRequest } from "../types/report";

export const CreateReport = async (report: CreateReportRequest): Promise<ApiResponse<null>> => {
    return await axiosInstance.post("/report", report)
}