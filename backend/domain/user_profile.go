package domain

import (
	"context"

	"gorm.io/gorm"
)

type UserProfile struct {
	gorm.Model
	UserID      uint64      `json:"user_id" gorm:"index"`
	AvatarID    uint        `gorm:"comment:头像文件ID" json:"avatar_id"`
	AvatarFile  StorageFile `json:"avatar_file" gorm:"foreignKey:AvatarID"`
	Description string      `gorm:"type:text;comment:个人简介" json:"description"`
}

type UpdateUserProfileRequest struct {
	OldAvatarID uint   `json:"old_avatar_id" validate:"gte=0"`
	NewAvatarID uint   `json:"new_avatar_id" validate:"gte=0"`
	Description string `json:"description" validate:"required"`
}

type UserProfileResponse struct {
	ID          uint                `json:"id"`
	UserID      uint64              `json:"-"`
	AvatarID    uint                `json:"avatar_id"`
	AvatarFile  StorageFileResponse `gorm:"foreignKey:AvatarID" json:"avatar_file" `
	Description string              `json:"description"`
}

type UserProfileRepository interface {
	UpdateProfile(c context.Context, profile *UserProfile) error
}
