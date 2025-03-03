package repository

import (
	"ModVerse/domain"
	"ModVerse/internal/utils"
	"context"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type CategoriesRepository struct {
	DB *gorm.DB
}

func NewCategoriesRepository(db *gorm.DB) domain.CategoriesRepository {
	return &CategoriesRepository{
		DB: db,
	}
}

func (r *CategoriesRepository) AddCategories(c context.Context, ca *domain.Categories) error {
	return r.DB.WithContext(c).Create(ca).Error
}

func (r *CategoriesRepository) DeleteCategories(c context.Context, id string) error {
	return r.DB.WithContext(c).Where("id = ?", id).Delete(&domain.Categories{}).Error
}

func (r *CategoriesRepository) GetCategories(c context.Context, params *domain.CategoriesQuery) (*[]domain.CategoriesResponse, int64, error) {
	var categories []domain.CategoriesResponse
	var total int64

	categoriesAllowedFields := map[string]struct{}{
		"created_at": {},
		"name":       {},
	}

	query := r.DB.WithContext(c).Model(&domain.Categories{})

	if params.Name != "" {
		query = query.Where("name LIKE ?", "%"+utils.EscapeLike(params.Name)+"%")
	}

	if params.Status != "" {
		query = query.Where("status = ?", params.Status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if total == 0 {
		return &[]domain.CategoriesResponse{}, 0, nil
	}

	sortField := utils.SafeSortField(params.Sort, categoriesAllowedFields, "name")
	orderDirection := utils.SafeOrderDirection(params.Order)

	query = query.Order(clause.OrderByColumn{
		Column: clause.Column{Name: sortField},
		Desc:   orderDirection == "desc",
	})

	query = utils.ApplyPaging(query, params.Page, params.PageSize)

	if err := query.Model(&domain.Categories{}).Find(&categories).Error; err != nil {
		return nil, 0, err
	}

	return &categories, total, nil
}

func (r *CategoriesRepository) GetCategoriesByID(c context.Context, id string) (*domain.CategoriesResponse, error) {
	var categories domain.CategoriesResponse
	if err := r.DB.WithContext(c).Model(&domain.Categories{}).Where("id = ?", id).First(&categories).Error; err != nil {
		return nil, err
	}
	return &categories, nil
}

func (r *CategoriesRepository) UpdateCategories(c context.Context, ca *domain.Categories) error {
	return r.DB.WithContext(c).Model(ca).Updates(ca).Error
}
