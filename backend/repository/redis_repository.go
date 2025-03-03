package repository

import (
	"ModVerse/domain"
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type redisRepository struct {
	RedisDB *redis.Client
}

const counterKeyPattern = "counters:%s:%s"

func NewRedisRepository(redisDB *redis.Client) domain.RedisRepository {
	return &redisRepository{
		RedisDB: redisDB,
	}
}

// GetValue 获取指定键的值
func (r *redisRepository) GetValue(c context.Context, key string) (string, error) {

	value, err := r.RedisDB.Get(c, key).Result()
	if err != nil {
		return "", err
	}
	return value, nil
}

// SetValue 设置指定键的值，并设置过期时间
func (r *redisRepository) SetValue(c context.Context, key string, value any, time time.Duration) error {
	if err := r.RedisDB.Set(c, key, value, time).Err(); err != nil {
		return err
	}

	return nil
}

// DeleteValue 删除指定键
func (r *redisRepository) DeleteValue(c context.Context, key string) error {
	if err := r.RedisDB.Del(c, key).Err(); err != nil {
		return err
	}

	return nil
}

// 添加到列表
func (r *redisRepository) AddItem(c context.Context, key string, value any) error {
	err := r.RedisDB.RPush(c, key, value).Err()
	if err != nil {
		return err
	}
	return nil
}

// 从列表中删除
func (r *redisRepository) RemoveItem(c context.Context, key string, value any) error {
	err := r.RedisDB.LRem(c, key, 0, value).Err()
	if err != nil {
		return err
	}
	return nil
}

// 获取所有项目
func (r *redisRepository) GetAllItems(c context.Context, key string) ([]string, error) {
	items, err := r.RedisDB.LRange(c, key, 0, -1).Result()
	if err != nil {
		return nil, err
	}
	return items, nil
}

func (r *redisRepository) Increment(c context.Context, res string, id string, field string) error {
	key := fmt.Sprintf(counterKeyPattern, res, id)
	_, err := r.RedisDB.HIncrBy(c, key, field, 1).Result()
	return err
}

func (r *redisRepository) Decrement(c context.Context, res string, id string, field string) error {
	key := fmt.Sprintf(counterKeyPattern, res, id)
	_, err := r.RedisDB.HIncrBy(c, key, field, -1).Result()
	return err
}

func (r *redisRepository) GetCount(c context.Context, db *gorm.DB, res string, id string, field string) (int64, error) {
	key := fmt.Sprintf(counterKeyPattern, res, id)
	// 1. 优先从 Redis 获取
	val, err := r.RedisDB.HGet(c, key, field).Int64()
	if err == nil {
		return val, nil
	}

	// 2. Redis 未命中时回源数据库
	var count int64
	err = db.Table(res+"s").
		Where("id = ?", id).
		Pluck(field, &count).Error
	if err != nil {
		return 0, err
	}

	// 3. 将数据库值回写到 Redis（设置过期时间防冷数据）
	r.RedisDB.HSet(c, key, field, count)
	r.RedisDB.Expire(c, key, 24*time.Hour)

	return count, nil
}
