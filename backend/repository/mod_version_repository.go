package repository

import (
	"ModVerse/domain"
	"context"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type modVersionRepository struct {
	DB *gorm.DB
}

func NewModVersionRepository(db *gorm.DB) domain.ModVersionRepository {
	return &modVersionRepository{
		DB: db,
	}
}

func (m *modVersionRepository) CreateModVersion(c context.Context, mv *domain.ModVersion) error {
	tx := m.DB.WithContext(c).Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err := tx.Create(mv).Error; err != nil {
		tx.Rollback()
		return err
	}

	mod := domain.Mod{
		LastUpdate: mv.CreatedAt,
	}
	mod.ID = mv.ModID

	if err := tx.Updates(&mod).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return err
	}

	return nil
}

func (m *modVersionRepository) DeleteModVersion(c context.Context, id string) error {
	return m.DB.WithContext(c).Select(clause.Associations).Delete(&domain.ModVersion{}, id).Error
}

func (m *modVersionRepository) GetModVersions(c context.Context, modID string) (*[]domain.ModVersionResponse, int64, error) {
	var modVersions []domain.ModVersionResponse
	var total int64

	query := m.DB.WithContext(c).Model(&domain.ModVersion{}).Where("mod_id = ?", modID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if total == 0 {
		return &[]domain.ModVersionResponse{}, 0, nil
	}

	if err := query.
		Preload("File", func(db *gorm.DB) *gorm.DB {
			return db.Model(&domain.StorageFile{}).Select("id,file_name,file_size,url,file_key")
		}).
		Find(&modVersions).Error; err != nil {
		return nil, 0, err
	}

	return &modVersions, total, nil
}

func (m *modVersionRepository) GetModVersion(c context.Context, id string) (*domain.ModVersionResponse, error) {
	var modVersion domain.ModVersionResponse

	if err := m.DB.WithContext(c).Model(&domain.ModVersion{}).Joins("File").First(&modVersion, id).Error; err != nil {
		return nil, err
	}

	return &modVersion, nil
}

func (m *modVersionRepository) GetDB() *gorm.DB {
	return m.DB
}
