package repository

import (
	"ModVerse/domain"
	"context"

	"gorm.io/gorm"
)

type userProfileRepository struct {
	DB *gorm.DB
}

func NewUserProfileRepository(db *gorm.DB) domain.UserProfileRepository {
	return &userProfileRepository{
		DB: db,
	}
}

func (r *userProfileRepository) UpdateProfile(c context.Context, profile *domain.UserProfile) error {
	return r.DB.WithContext(c).Model(profile).Where("user_id = ?", profile.UserID).Updates(profile).Error
}
