package repository

import (
	"ModVerse/domain"
	"ModVerse/internal/utils"
	"context"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type reportRepository struct {
	db *gorm.DB
}

func NewReportRepository(db *gorm.DB) domain.ReportRepository {
	return &reportRepository{
		db: db,
	}
}

func (r *reportRepository) Create(ctx context.Context, report *domain.Report) error {
	return r.db.WithContext(ctx).Model(&domain.Report{}).Create(report).Error
}

func (r *reportRepository) Update(ctx context.Context, report *domain.Report) error {
	return r.db.WithContext(ctx).Model(report).Updates(report).Error
}

func (r *reportRepository) GetByID(ctx context.Context, id string) (*domain.ReportResponse, error) {
	var report domain.ReportResponse

	if err := r.db.WithContext(ctx).Model(&domain.Report{}).Joins("Reporter").Where("id = ?", id).First(&report).Error; err != nil {
		return nil, err
	}

	return &report, nil
}

func (r *reportRepository) List(ctx context.Context, params *domain.ReportQuery) (*[]domain.ReportResponse, int64, error) {
	var reports *[]domain.ReportResponse
	var total int64

	reportAllowedFields := map[string]struct{}{
		"created_at": {},
	}

	query := r.db.WithContext(ctx).Model(&domain.Report{}).Joins("Reporter")

	// 应用过滤条件
	if params.Type != "" {
		query = query.Where("type = ?", params.Type)
	}
	if params.Status != "" {
		query = query.Where("reports.status = ?", params.Status)
	}
	if params.Target != 0 {
		query = query.Where("target = ?", params.Target)
	}
	if params.Reporter != "" {
		query = query.Where("reporter.user_name LIKE ?", "%"+utils.EscapeLike(params.Reporter)+"%")
	}
	if params.Reason != "" {
		query = query.Where("reason LIKE ?", "%"+utils.EscapeLike(params.Reason)+"%")
	}
	if params.StartTime != nil {
		query = query.Where("reports.created_at >= ?", *params.StartTime)
	}
	if params.EndTime != nil {
		query = query.Where("reports.created_at <= ?", *params.EndTime)
	}

	// 获取总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if total == 0 {
		return &[]domain.ReportResponse{}, 0, nil
	}
	sortField := utils.SafeSortField(params.Sort, reportAllowedFields, "created_at")
	orderDirection := utils.SafeOrderDirection(params.Order)

	query = query.Order(clause.OrderByColumn{
		Column: clause.Column{Name: sortField},
		Desc:   orderDirection == "desc",
	})

	query = utils.ApplyPaging(query, params.Page, params.PageSize)

	if err := query.Find(&reports).Error; err != nil {
		return nil, 0, err
	}

	return reports, total, nil
}

func (r *reportRepository) DeleteReport(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Where("id = ?", id).Delete(&domain.Report{}).Error
}
