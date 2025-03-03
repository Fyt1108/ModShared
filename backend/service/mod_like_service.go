package service

import (
	"ModVerse/domain"
	"context"
	"errors"
	"fmt"
	"strconv"
	"time"
)

type modLikeService struct {
	likeRepo  domain.ModLikeRepository
	redisRepo domain.RedisRepository
	timeout   time.Duration
}

func NewModLikeService(
	likeRepo domain.ModLikeRepository,
	redisRepo domain.RedisRepository,
	timeout time.Duration,
) domain.ModLikeService {
	return &modLikeService{
		likeRepo:  likeRepo,
		redisRepo: redisRepo,
		timeout:   timeout,
	}
}

const LikeCacheKey = "like:%s:%s"

func (s *modLikeService) LikeMod(c context.Context, like *domain.ModLike) error {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	key := fmt.Sprintf(LikeCacheKey, fmt.Sprint(like.UserID), fmt.Sprint(like.ModID))
	// 检查缓存
	cached, _ := s.redisRepo.GetValue(ctx, key)
	cachedUint64, _ := strconv.ParseUint(cached, 10, 64)
	if cachedUint64 == 1 {
		return errors.New("already liked")
	}

	if err := s.likeRepo.Create(c, like); err != nil {
		return err
	}

	if err := s.redisRepo.SetValue(ctx, key, true, 24*time.Hour); err != nil {
		return err
	}

	return nil
}

func (s *modLikeService) UnlikeMod(c context.Context, userID, modID string) error {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	key := fmt.Sprintf(LikeCacheKey, userID, modID)
	// 检查缓存
	cached, _ := s.redisRepo.GetValue(ctx, key)
	cachedUint64, _ := strconv.ParseUint(cached, 10, 64)
	if cachedUint64 == 0 {
		return errors.New("not liked")
	}

	if err := s.likeRepo.Delete(c, userID, modID); err != nil {
		return err
	}

	if err := s.redisRepo.DeleteValue(ctx, key); err != nil {
		return err
	}

	return nil
}

func (s *modLikeService) GetLikeStatus(c context.Context, userID, modID string) (bool, error) {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	key := fmt.Sprintf(LikeCacheKey, userID, modID)
	// 先查缓存
	cached, err := s.redisRepo.GetValue(ctx, key)
	if err == nil {
		cachedUint64, _ := strconv.ParseUint(cached, 10, 64)
		if cachedUint64 == 0 {
			return false, nil
		} else {
			return true, nil
		}
	}

	// 缓存未命中查数据库
	exists, err := s.likeRepo.Exists(ctx, userID, modID)
	if err != nil {
		return false, err
	}

	// 回填缓存
	if err := s.redisRepo.SetValue(ctx, key, exists, 24*time.Hour); err != nil {
		return false, err
	}

	return exists, nil
}
