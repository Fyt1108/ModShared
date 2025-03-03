package repository

import (
	"ModVerse/domain"
	"ModVerse/internal/utils"
	"context"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type modFavoriteRepository struct {
	DB *gorm.DB
}

func NewModFavoriteRepository(db *gorm.DB) domain.ModFavoriteRepository {
	return &modFavoriteRepository{
		DB: db,
	}
}

func (m *modFavoriteRepository) CheckIsFavorite(c context.Context, userID string, modID string) (bool, error) {
	var total int64
	if err := m.DB.WithContext(c).Model(&domain.ModFavorite{}).Where("user_id = ? AND mod_id = ?", userID, modID).Count(&total).Error; err != nil {
		return false, err
	}

	if total <= 0 {
		return false, nil
	}
	return true, nil
}

func (m *modFavoriteRepository) CreateModFavorite(c context.Context, modFavorite *domain.ModFavorite) error {
	if err := m.DB.WithContext(c).Create(modFavorite).Error; err != nil {
		return err
	}

	return nil
}

func (m *modFavoriteRepository) DeleteModFavorite(c context.Context, userID string, modID string) error {
	if err := m.DB.WithContext(c).Delete(&domain.ModFavorite{}, "user_id = ? AND mod_id = ?", userID, modID).Error; err != nil {
		return err
	}

	return nil
}

func (m *modFavoriteRepository) GetModFavorites(c context.Context, userID string, params *domain.ModFavoriteQuery) (*[]domain.ModFavoriteResponse, int64, error) {
	var modFavorites []domain.ModFavoriteResponse
	var total int64

	modAllowedFields := map[string]struct{}{
		"likes":           {},
		"name":            {},
		"total_downloads": {},
		"last_update":     {},
	}

	query := m.DB.WithContext(c).Model(&domain.ModFavorite{}).Joins("Mod").Where("mod_favorites.user_id = ?", userID)

	if params.Name != "" {
		query = query.Where("mod.name LIKE ?", "%"+utils.EscapeLike(params.Name)+"%")
	}

	if params.GameID != 0 {
		query = query.Where("mod.game_id = ?", params.GameID)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if total == 0 {
		return &[]domain.ModFavoriteResponse{}, 0, nil
	}

	sortField := "mod." + utils.SafeSortField(params.Sort, modAllowedFields, "last_update")
	orderDirection := utils.SafeOrderDirection(params.Order)

	query = query.Order(clause.OrderByColumn{
		Column: clause.Column{Name: sortField},
		Desc:   orderDirection == "desc",
	})

	query = utils.ApplyPaging(query, params.Page, params.PageSize)

	if err := query.Model(&domain.ModFavorite{}).Joins("Mod.CoverFile").Joins("Mod.Game").Find(&modFavorites).Error; err != nil {
		return nil, 0, err
	}

	return &modFavorites, total, nil
}
