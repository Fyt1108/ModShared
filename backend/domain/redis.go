package domain

import (
	"context"
	"time"

	"gorm.io/gorm"
)

type RedisRepository interface {
	GetValue(c context.Context, key string) (string, error)
	SetValue(c context.Context, key string, value any, time time.Duration) error
	DeleteValue(c context.Context, key string) error
	AddItem(c context.Context, key string, value any) error
	RemoveItem(c context.Context, key string, value any) error
	GetAllItems(c context.Context, key string) ([]string, error)
	Increment(c context.Context, res string, id string, field string) error
	Decrement(c context.Context, res string, id string, field string) error
	GetCount(c context.Context, db *gorm.DB, res string, id string, field string) (int64, error)
}
