package domain

import (
	"context"
	"time"

	"gorm.io/gorm"
)

type Report struct {
	gorm.Model
	Type         string `gorm:"index;not null;size:32;comment:举报类型(mod/comment)" json:"type"`
	Target       uint   `gorm:"index;not null;comment:举报目标ID" json:"target"`
	ReporterID   uint64 `gorm:"index;not null;comment:举报者ID" json:"reporter_id"`
	Reporter     User   `gorm:"foreignKey:ReporterID" json:"reporter"`
	Reason       string `gorm:"type:text;not null;comment:举报原因" json:"reason"`
	Status       string `gorm:"index;default:pending;comment:状态(pending/processed/rejected);size:32" json:"status"`
	AdminComment string `gorm:"type:text;comment:管理员处理意见" json:"admin_comment,omitempty"`
}

type ReportResponse struct {
	ID           uint         `json:"id"`
	Type         string       `json:"type"`
	Target       uint         `json:"target"`
	ReporterID   uint64       `json:"-"`
	Reporter     UserResponse `gorm:"foreignKey:ReporterID" json:"reporter"`
	Reason       string       `json:"reason"`
	Status       string       `json:"status"`
	AdminComment string       `json:"admin_comment,omitempty"`
	CreatedAt    time.Time    `json:"created_at"`
}

type CreateReportRequest struct {
	Type   string `json:"type" validate:"required,oneof=mod comment"`
	Target uint   `json:"target" validate:"required"`
	Reason string `json:"reason" validate:"required"`
}

type UpdateReportRequest struct {
	Status       string `json:"status" validate:"required,oneof=processed rejected"`
	AdminComment string `json:"admin_comment"`
}

type ReportQuery struct {
	Paging
	Type      string     `json:"type"`
	Status    string     `json:"status"`
	Target    uint       `json:"target"`
	Reporter  string     `json:"reporter"`
	Reason    string     `json:"reason"`
	StartTime *time.Time `json:"start_time"`
	EndTime   *time.Time `json:"end_time"`
}

type ReportRepository interface {
	Create(c context.Context, report *Report) error
	Update(c context.Context, report *Report) error
	GetByID(c context.Context, id string) (*ReportResponse, error)
	List(c context.Context, params *ReportQuery) (*[]ReportResponse, int64, error)
	DeleteReport(c context.Context, id string) error
}

type ReportService interface {
	CreateReport(c context.Context, report *Report) error
	UpdateReport(c context.Context, id string, req *UpdateReportRequest) error
	GetReport(c context.Context, id string) (*ReportResponse, error)
	GetReports(c context.Context, params *ReportQuery) (*[]ReportResponse, int64, error)
	DeleteReport(c context.Context, id string) error
}
