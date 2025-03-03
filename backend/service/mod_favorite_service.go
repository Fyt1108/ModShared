package service

import (
	"ModVerse/domain"
	"context"
	"errors"
	"fmt"
	"strconv"
	"time"
)

type modFavoriteService struct {
	modFavoriteRepo domain.ModFavoriteRepository
	redisRepo       domain.RedisRepository
	timeout         time.Duration
}

const FavoriteCacheKey = "favorite:%s:%s"

func NewModFavoriteService(r domain.ModFavoriteRepository, rd domain.RedisRepository, timeout time.Duration) domain.ModFavoriteService {
	return &modFavoriteService{
		modFavoriteRepo: r,
		redisRepo:       rd,
		timeout:         timeout,
	}
}

func (m *modFavoriteService) CheckIsFavorite(c context.Context, userID string, modID string) (bool, error) {
	ctx, cancel := context.WithTimeout(c, m.timeout)
	defer cancel()

	key := fmt.Sprintf(FavoriteCacheKey, userID, modID)
	// 先查缓存
	cached, err := m.redisRepo.GetValue(ctx, key)
	if err == nil {
		cachedUint64, _ := strconv.ParseUint(cached, 10, 64)
		if cachedUint64 == 0 {
			return false, nil
		} else {
			return true, nil
		}
	}

	// 缓存没有，查数据库
	isFavorite, err := m.modFavoriteRepo.CheckIsFavorite(ctx, userID, modID)
	if err != nil {
		return false, err
	}

	if err := m.redisRepo.SetValue(ctx, key, isFavorite, 24*time.Hour); err != nil {
		return false, err
	}

	return isFavorite, nil
}

func (m *modFavoriteService) CreateModFavorite(c context.Context, modFavorite *domain.ModFavorite) error {
	ctx, cancel := context.WithTimeout(c, m.timeout)
	defer cancel()

	key := fmt.Sprintf(FavoriteCacheKey, fmt.Sprint(modFavorite.UserID), fmt.Sprint(modFavorite.ModID))
	cached, _ := m.redisRepo.GetValue(ctx, key)
	cachedUint64, _ := strconv.ParseUint(cached, 10, 64)
	if cachedUint64 == 1 {
		return errors.New("already favorite")
	}

	if err := m.modFavoriteRepo.CreateModFavorite(ctx, modFavorite); err != nil {
		return err
	}

	if err := m.redisRepo.SetValue(ctx, key, true, 24*time.Hour); err != nil {
		return err
	}

	return nil
}

func (m *modFavoriteService) DeleteModFavorite(c context.Context, userID string, modID string) error {
	ctx, cancel := context.WithTimeout(c, m.timeout)
	defer cancel()

	key := fmt.Sprintf(FavoriteCacheKey, userID, modID)
	cached, _ := m.redisRepo.GetValue(ctx, key)
	cachedUint64, _ := strconv.ParseUint(cached, 10, 64)
	if cachedUint64 == 0 {
		return errors.New("not favorite")
	}

	if err := m.modFavoriteRepo.DeleteModFavorite(ctx, userID, modID); err != nil {
		return err
	}

	if err := m.redisRepo.DeleteValue(ctx, key); err != nil {
		return err
	}

	return nil
}

func (m *modFavoriteService) GetModFavorites(c context.Context, userID string, params *domain.ModFavoriteQuery) (*[]domain.ModFavoriteResponse, int64, error) {
	ctx, cancel := context.WithTimeout(c, m.timeout)
	defer cancel()
	return m.modFavoriteRepo.GetModFavorites(ctx, userID, params)
}
