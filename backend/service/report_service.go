package service

import (
	"ModVerse/domain"
	"context"
	"strconv"
	"time"
)

type reportService struct {
	reportRepo domain.ReportRepository
	redisRepo  domain.RedisRepository
	timeout    time.Duration
}

func NewReportService(reportRepo domain.ReportRepository, rd domain.RedisRepository, t time.Duration) domain.ReportService {
	return &reportService{
		reportRepo: reportRepo,
		redisRepo:  rd,
		timeout:    t,
	}
}

func (s *reportService) CreateReport(c context.Context, report *domain.Report) error {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()
	//设置初始状态
	report.Status = "pending"
	return s.reportRepo.Create(ctx, report)
}

func (s *reportService) UpdateReport(c context.Context, id string, req *domain.UpdateReportRequest) error {
	report := domain.Report{
		Status:       req.Status,
		AdminComment: req.AdminComment,
	}

	reportID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		return err
	}
	report.ID = uint(reportID)

	// 更新状态和管理员备注
	report.Status = req.Status
	report.AdminComment = req.AdminComment

	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	return s.reportRepo.Update(ctx, &report)
}

func (s *reportService) GetReport(c context.Context, id string) (*domain.ReportResponse, error) {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	report, err := s.reportRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return report, nil
}

func (s *reportService) GetReports(c context.Context, params *domain.ReportQuery) (*[]domain.ReportResponse, int64, error) {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	return s.reportRepo.List(ctx, params)
}

func (s *reportService) DeleteReport(c context.Context, id string) error {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	return s.reportRepo.DeleteReport(ctx, id)
}
