import type { User } from "./user"

export type Report = {
    id: number
    type: string
    target: number
    reporter: User
    reason: string
    status: string
    admin_comment: string
    created_at: string
}

export type ReportList = {
    list: Report[]
    total: number
}

export type UpdateReportRequest = {
    status: string
    admin_comment: string
}

export type ReportQuery = {
    type?: string //mod/commit
    status?: string //pending/processed/rejected
    target?: number
    reporter?: string
    reason?: string
    startTime?: string | null
    endTime?: string | null
} & Paging
