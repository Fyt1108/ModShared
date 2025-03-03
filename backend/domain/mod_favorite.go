package domain

import (
	"context"
	"time"

	"gorm.io/gorm"
)

type ModFavorite struct {
	gorm.Model
	UserID uint64 `gorm:"index:idx_user_mod;not null;comment:用户ID" json:"user_id"`
	ModID  uint   `gorm:"index:idx_user_mod;not null;comment:模组ID" json:"mod_id"`
	Mod    Mod    `gorm:"foreignKey:ModID;" json:"mod"`
}

type CreateModFavoriteRequest struct {
	ModID uint `json:"mod_id" validate:"required"`
}

type ModFavoriteResponse struct {
	CreatedAt time.Time           `json:"created_at"`
	ModID     uint                `json:"-"`
	Mod       ModResponseWithUser `gorm:"foreignKey:ModID;" json:"mod"`
}

type ModFavoriteQuery struct {
	Paging
	Name   string `json:"name"`
	GameID uint   `json:"game_id"`
}

type ModFavoriteRepository interface {
	CreateModFavorite(c context.Context, modFavorite *ModFavorite) error
	GetModFavorites(c context.Context, userID string, params *ModFavoriteQuery) (*[]ModFavoriteResponse, int64, error)
	CheckIsFavorite(c context.Context, userID string, modID string) (bool, error)
	DeleteModFavorite(c context.Context, userID string, modID string) error
}

type ModFavoriteService interface {
	CreateModFavorite(c context.Context, modFavorite *ModFavorite) error
	GetModFavorites(c context.Context, userID string, params *ModFavoriteQuery) (*[]ModFavoriteResponse, int64, error)
	CheckIsFavorite(c context.Context, userID string, modID string) (bool, error)
	DeleteModFavorite(c context.Context, userID string, modID string) error
}
