package domain

import (
	"time"

	"gorm.io/gorm"
)

type Model struct {
	ID        uint64 `gorm:"primaryKey;autoIncrement:false"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

type Paging struct {
	Page     int    `query:"page"`
	PageSize int    `query:"page_size"`
	Sort     string `query:"sort"`
	Order    string `query:"order"`
}
