package repository

import (
	"ModVerse/domain"
	"context"

	"gorm.io/gorm"
)

type modLikeRepository struct {
	DB *gorm.DB
}

func NewModLikeRepository(db *gorm.DB) domain.ModLikeRepository {
	return &modLikeRepository{DB: db}
}

func (r *modLikeRepository) Create(c context.Context, like *domain.ModLike) error {
	tx := r.DB.WithContext(c).Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err := tx.Create(like).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Model(&domain.Mod{}).Where("id = ?", like.ModID).Update("likes", gorm.Expr("likes + ?", 1)).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return err
	}

	return nil
}

func (r *modLikeRepository) Delete(c context.Context, userID, modID string) error {
	tx := r.DB.WithContext(c).Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err := tx.Where("user_id = ? AND mod_id = ?", userID, modID).Delete(&domain.ModLike{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Model(&domain.Mod{}).Where("id = ?", modID).Update("likes", gorm.Expr("likes - ?", 1)).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return err
	}

	return nil
}

func (r *modLikeRepository) Exists(c context.Context, userID, modID string) (bool, error) {
	var count int64
	err := r.DB.WithContext(c).Model(&domain.ModLike{}).
		Where("user_id = ? AND mod_id = ?", userID, modID).
		Count(&count).Error
	return count > 0, err
}
