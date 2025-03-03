package domain

import (
	"context"
	"time"

	"gorm.io/gorm"
)

// ModVersion 模组版本
type ModVersion struct {
	gorm.Model
	ModID     uint        `gorm:"index;not null;comment:模组ID" json:"mod_id"`
	Downloads uint        `gorm:"default:0;comment:下载量" json:"downloads"`
	Version   string      `gorm:"size:32;not null;comment:版本号" json:"version"`
	ChangeLog string      `gorm:"type:text;comment:更新日志" json:"change_log"`
	FileID    uint        `gorm:"index;not null;comment:文件ID" json:"file_id"`
	File      StorageFile `gorm:"foreignKey:FileID" json:"file"`
}

type CreateModVersionRequest struct {
	ModID     uint   `json:"mod_id" validate:"required"`
	Version   string `json:"version" validate:"required"`
	ChangeLog string `json:"change_log"`
	FileID    uint   `json:"file_id" validate:"required"`
}

type ModVersionResponse struct {
	ID        uint                 `json:"id"`
	Downloads uint                 `json:"downloads"`
	Version   string               `json:"version"`
	ChangeLog string               `json:"change_log"`
	FileID    uint                 `json:"-"`
	File      DownloadFileResponse `gorm:"foreignKey:FileID" json:"file"`
	CreatedAt time.Time            `json:"created_at"`
}

type ModVersionRepository interface {
	CreateModVersion(c context.Context, mv *ModVersion) error
	GetModVersions(c context.Context, modID string) (*[]ModVersionResponse, int64, error)
	DeleteModVersion(c context.Context, id string) error
	GetModVersion(c context.Context, id string) (*ModVersionResponse, error)
	GetDB() *gorm.DB
}

type ModVersionService interface {
	CreateModVersion(c context.Context, mv *ModVersion) error
	GetModVersions(c context.Context, modID string) (*[]ModVersionResponse, int64, error)
	DeleteModVersion(c context.Context, id string) error
	UpdateCount(c context.Context, id string, modID string) (int64, error)
}
