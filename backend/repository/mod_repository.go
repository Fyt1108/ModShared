package repository

import (
	"ModVerse/domain"
	"ModVerse/internal/utils"
	"context"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type modRepository struct {
	DB *gorm.DB
}

func NewModRepository(db *gorm.DB) domain.ModRepository {
	return &modRepository{
		DB: db,
	}
}

func (m *modRepository) CreateMod(c context.Context, mod *domain.Mod, modVersion *domain.ModVersion) error {
	tx := m.DB.WithContext(c).Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err := tx.Create(mod).Error; err != nil {
		tx.Rollback()
		return err
	}

	modVersion.ModID = mod.ID

	if err := tx.Create(modVersion).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Model(&domain.Game{}).Where("id = ?", mod.GameID).UpdateColumn("mod_nums", gorm.Expr("mod_nums + ?", 1)).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return err
	}

	return nil
}

func (m *modRepository) DeleteMod(c context.Context, id uint) error {
	tx := m.DB.WithContext(c).Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err := tx.Select("File").Delete(&domain.ModVersion{}, "mod_id = ?", id).Error; err != nil {
		tx.Rollback()
		return err
	}

	var mod domain.Mod
	mod.ID = id

	if err := tx.First(&mod).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Select(clause.Associations).Delete(mod).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Model(&domain.Game{}).Where("game_id = ?", mod.GameID).UpdateColumn("mod_nums", gorm.Expr("mod_nums - ?", 1)).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return err
	}

	return nil
}

func (m *modRepository) GetMod(c context.Context, id string) (*domain.Mod, error) {
	var mod domain.Mod

	if err := m.DB.WithContext(c).Preload("User.UserProfile.AvatarFile").Preload("Game").Preload("CoverFile").First(&mod, id).Error; err != nil {
		return nil, err
	}
	return &mod, nil
}

func (m *modRepository) GetMods(c context.Context, params *domain.ModQuery) (*[]domain.ModResponse, int64, error) {
	var apiMods []domain.ModResponse
	var total int64
	modAllowedFields := map[string]struct{}{
		"likes":          {},
		"name":           {},
		"total_download": {},
		"last_update":    {},
		"created_at":     {},
	}

	query := m.DB.WithContext(c).Model(&domain.Mod{}).Joins("User").Joins("Game")

	if params.Name != "" {
		query = query.Where("mods.name LIKE ?", "%"+utils.EscapeLike(params.Name)+"%")
	}

	if params.GameID != 0 {
		query = query.Where("mods.game_id = ?", params.GameID)
	}

	if len(params.Category) > 0 {
		query = query.Where("category IN (?)", params.Category)
	}

	if params.UserID != "" {
		query = query.Where("mods.user_id =?", params.UserID)
	}

	if params.Status != "" {
		query = query.Where("mods.status =?", params.Status)
	}

	if params.UserName != "" {
		query = query.Where("user.user_name LIKE ?", "%"+utils.EscapeLike(params.UserName)+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if total == 0 {
		return &[]domain.ModResponse{}, 0, nil
	}

	sortField := utils.SafeSortField(params.Sort, modAllowedFields, "name")
	orderDirection := utils.SafeOrderDirection(params.Order)

	query = query.Order(clause.OrderByColumn{
		Column: clause.Column{Name: sortField},
		Desc:   orderDirection == "desc",
	})

	query = utils.ApplyPaging(query, params.Page, params.PageSize)

	if err := query.Joins("CoverFile").Find(&apiMods).Error; err != nil {
		return nil, 0, err
	}
	return &apiMods, total, nil
}

func (m *modRepository) UpdateMod(c context.Context, mod *domain.Mod) error {
	if err := m.DB.WithContext(c).Updates(mod).Error; err != nil {
		return err
	}
	return nil
}
