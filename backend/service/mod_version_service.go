package service

import (
	"ModVerse/domain"
	"ModVerse/internal/utils"
	"context"
	"time"
)

type modVersionService struct {
	modVersionRepo domain.ModVersionRepository
	redisRepo      domain.RedisRepository
	timeout        time.Duration
}

func NewModVersionService(r domain.ModVersionRepository, rd domain.RedisRepository, timeout time.Duration) domain.ModVersionService {
	return &modVersionService{
		modVersionRepo: r,
		redisRepo:      rd,
		timeout:        timeout,
	}
}

func (m *modVersionService) CreateModVersion(c context.Context, mv *domain.ModVersion) error {
	ctx, cancel := context.WithTimeout(c, m.timeout)
	defer cancel()
	return m.modVersionRepo.CreateModVersion(ctx, mv)
}

func (m *modVersionService) DeleteModVersion(c context.Context, id string) error {
	ctx, cancel := context.WithTimeout(c, m.timeout)
	defer cancel()

	modVersion, err := m.modVersionRepo.GetModVersion(ctx, id)
	if err != nil {
		return err
	}

	if err := m.modVersionRepo.DeleteModVersion(ctx, id); err != nil {
		return err
	}

	if err := utils.DeleteFile(modVersion.File.FileKey); err != nil {
		return nil
	}

	return nil
}

func (m *modVersionService) GetModVersions(c context.Context, modID string) (*[]domain.ModVersionResponse, int64, error) {
	ctx, cancel := context.WithTimeout(c, m.timeout)
	defer cancel()
	return m.modVersionRepo.GetModVersions(ctx, modID)
}

func (m *modVersionService) UpdateCount(c context.Context, id string, modID string) (int64, error) {
	ctx, cancel := context.WithTimeout(c, m.timeout)
	defer cancel()

	if err := m.redisRepo.Increment(ctx, "mod_version", id, "downloads"); err != nil {
		return 0, err
	}

	if err := m.redisRepo.Increment(ctx, "mod", modID, "total_downloads"); err != nil {
		return 0, err
	}

	db := m.modVersionRepo.GetDB()

	count, err := m.redisRepo.GetCount(ctx, db, "mod_version", id, "downloads")
	if err != nil {
		return 0, err
	}

	return count, nil
}
