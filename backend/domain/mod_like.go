package domain

import (
	"context"

	"gorm.io/gorm"
)

type ModLike struct {
	gorm.Model
	UserID uint64 `gorm:"index:idx_user_mod;not null;comment:用户ID" json:"user_id"`
	ModID  uint   `gorm:"index:idx_user_mod;not null;comment:模组ID" json:"mod_id"`
}

type ModLikeRepository interface {
	Create(c context.Context, like *ModLike) error
	Delete(c context.Context, userID, modID string) error
	Exists(c context.Context, userID, modID string) (bool, error)
}

type ModLikeService interface {
	LikeMod(c context.Context, like *ModLike) error
	UnlikeMod(c context.Context, userID, modID string) error
	GetLikeStatus(c context.Context, userID, modID string) (bool, error)
}
