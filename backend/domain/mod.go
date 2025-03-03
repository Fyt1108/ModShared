package domain

import (
	"context"
	"time"

	"gorm.io/gorm"
)

// 模组表
type Mod struct {
	gorm.Model
	Name           string       `gorm:"index;size:128;not null;comment:模组名称" json:"name"`
	Description    string       `gorm:"type:text;not null;comment:模组描述" json:"description"`
	Content        string       `gorm:"type:json;not null;comment:模组内容" json:"content"`
	Category       string       `gorm:"size:64;not null;comment:分类" json:"category"`
	CoverID        uint         `gorm:"not null;comment:封面文件ID" json:"-"`
	CoverFile      StorageFile  `json:"cover_file" gorm:"foreignKey:CoverID"`
	UserID         uint64       `gorm:"index;not null;comment:上传者ID" json:"-"`
	User           User         `json:"user" gorm:"foreignKey:UserID"`
	GameID         uint         `gorm:"index;not null;comment:游戏ID" json:"-"`
	Game           Game         `json:"game" gorm:"foreignKey:GameID"`
	Likes          uint         `gorm:"default:0;comment:点赞数" json:"likes"`
	Status         string       `gorm:"size:32;default:'pending';comment:状态(enable/disable/pending)" json:"status"`
	LastUpdate     time.Time    `gorm:"index;not null;comment:最后更新时间" json:"last_update"`
	TotalDownloads uint         `gorm:"default:0;comment:总下载量" json:"total_downloads"`
	ModVersions    []ModVersion `json:"mod_versions"`
	Comments       []Comment    `json:"comments"`
}

type CreateModRequest struct {
	Name        string `json:"name" validate:"required"`
	Description string `json:"description" validate:"required"`
	Content     string `json:"content" validate:"required"`
	Category    string `json:"category" validate:"required"`
	CoverID     uint   `json:"cover_id" validate:"required"`
	GameID      uint   `json:"game_id" validate:"required"`
	FileID      uint   `json:"file_id" validate:"required"`
	Version     string `json:"version" validate:"required"`
}

type UpdateModRequest struct {
	Description string `json:"description"`
	Content     string `json:"content"`
	Status      string `json:"status"`
}

type ModResponse struct {
	ID             uint                `json:"id"`
	Name           string              `json:"name"`
	Description    string              `json:"description"`
	Category       string              `json:"category"`
	UserID         uint64              `json:"-"`
	User           UserResponse        `gorm:"foreignKey:UserID" json:"user"`
	GameID         uint                `json:"-"`
	Game           GameResponse        `gorm:"foreignKey:GameID" json:"game"`
	CoverID        uint                `json:"-"`
	CoverFile      StorageFileResponse `gorm:"foreignKey:CoverID" json:"cover_file"`
	Likes          uint                `json:"likes"`
	TotalDownloads uint                `json:"total_downloads"`
	Status         string              `json:"status"`
	Content        string              `json:"content"`
	LastUpdate     time.Time           `json:"last_update"`
	CreatedAt      time.Time           `json:"created_at"`
}

type ModResponseWithUser struct {
	ID             uint                `json:"id"`
	Name           string              `json:"name"`
	Description    string              `json:"description"`
	Category       string              `json:"category"`
	UserID         uint64              `json:"-"`
	GameID         uint                `json:"-"`
	Game           GameResponse        `gorm:"foreignKey:GameID" json:"game"`
	CoverID        uint                `json:"cover_id"`
	CoverFile      StorageFileResponse `gorm:"foreignKey:CoverID" json:"cover_file"`
	TotalDownloads uint                `json:"total_downloads"`
	Likes          uint                `json:"likes"`
	LastUpdate     time.Time           `json:"last_update"`
}

type ModQuery struct {
	Paging
	Name     string   `json:"name"`
	Category []string `json:"categories"`
	GameID   uint     `json:"game_id"`
	UserID   string   `json:"user_id"`
	UserName string   `json:"user_name"`
	Status   string   `json:"status"`
}

type ModRepository interface {
	CreateMod(c context.Context, mod *Mod, modVersion *ModVersion) error
	DeleteMod(c context.Context, id uint) error
	UpdateMod(c context.Context, mod *Mod) error
	GetMod(c context.Context, id string) (*Mod, error)
	GetMods(c context.Context, params *ModQuery) (*[]ModResponse, int64, error)
}

type ModService interface {
	CreateMod(c context.Context, mod *Mod, modVersion *ModVersion, userID string) error
	UpdateMod(c context.Context, mod *Mod) error
	GetMod(c context.Context, id string) (*Mod, error)
	GetMods(c context.Context, params *ModQuery) (*[]ModResponse, int64, error)
	DeleteMod(c context.Context, id string) error
}
