package domain

import (
	"context"
	"time"

	"gorm.io/gorm"
)

// 游戏表
type Game struct {
	gorm.Model
	Name        string      `gorm:"index;size:128;comment:游戏名称" json:"name"`
	LogoID      uint        `gorm:"index;comment:Logo文件ID" json:"logo_id"`
	LogoFile    StorageFile `gorm:"foreignKey:LogoID" json:"logo_file"`
	ModNums     uint        `gorm:"default:0;comment:MOD数" json:"mod_nums"`
	Publishers  string      `gorm:"index;size:128;comment:发行商" json:"publishers"`
	Developers  string      `gorm:"index;size:128;comment:开发者" json:"developers"`
	ReleaseTime time.Time   `gorm:"index;comment:发行时间" json:"release_time"`
}

type CreateGameRequest struct {
	Name        string    `json:"name" validate:"required"`
	LogoID      uint      `json:"logo_id" validate:"required"`
	Publishers  string    `json:"publishers" validate:"required"`
	Developers  string    `json:"developers" validate:"required"`
	ReleaseTime time.Time `json:"release_time" validate:"required"`
}

type UpdateGameRequest struct {
	Name        string    `json:"name" validate:"required"`
	OldLogoID   uint      `json:"old_logo_id"`
	NewLogoID   uint      `json:"new_logo_id"`
	Publishers  string    `json:"publishers" validate:"required"`
	Developers  string    `json:"developers" validate:"required"`
	ReleaseTime time.Time `json:"release_time" validate:"required"`
}

type GameResponse struct {
	ID          uint                `json:"id"`
	Name        string              `json:"name"`
	LogoID      uint                `json:"logo_id"`
	LogoFile    StorageFileResponse `gorm:"foreignKey:LogoID" json:"logo_file"`
	ModNums     uint                `json:"mod_nums"`
	Publishers  string              `json:"publishers"`
	Developers  string              `json:"developers"`
	ReleaseTime time.Time           `json:"release_time"`
}

type GameQuery struct {
	Paging
	Name string `query:"name"`
}

type GameRepository interface {
	CreateGame(c context.Context, game *Game) error
	GetGame(c context.Context, id string) (*GameResponse, error)
	GetGames(c context.Context, params *GameQuery) (*[]GameResponse, int64, error)
	UpdateGame(c context.Context, game *Game) error
	DeleteGame(c context.Context, id string) error
}

type GameService interface {
	CreateGame(c context.Context, game *Game) error
	GetGame(c context.Context, id string) (*GameResponse, error)
	GetGames(c context.Context, params *GameQuery) (*[]GameResponse, int64, error)
	UpdateGame(c context.Context, id string, req *UpdateGameRequest) error
	DeleteGame(c context.Context, id string) error
}
