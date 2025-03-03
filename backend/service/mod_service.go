package service

import (
	"ModVerse/domain"
	"ModVerse/internal/utils"
	"context"
	"strconv"
	"time"
)

type modService struct {
	modRepo        domain.ModRepository
	modVersionRepo domain.ModVersionRepository
	redisRepo      domain.RedisRepository
	timeout        time.Duration
}

func NewModService(r domain.ModRepository, mvr domain.ModVersionRepository, rd domain.RedisRepository, timeout time.Duration) domain.ModService {
	return &modService{
		modRepo:        r,
		redisRepo:      rd,
		timeout:        timeout,
		modVersionRepo: mvr,
	}
}

func (m *modService) CreateMod(c context.Context, mod *domain.Mod, modVersion *domain.ModVersion, userID string) error {
	ctx, cancel := context.WithTimeout(c, m.timeout)
	defer cancel()

	return m.modRepo.CreateMod(ctx, mod, modVersion)
}

func (m *modService) GetMod(c context.Context, id string) (*domain.Mod, error) {
	ctx, cancel := context.WithTimeout(c, m.timeout)
	defer cancel()

	return m.modRepo.GetMod(ctx, id)
}

func (m *modService) GetMods(c context.Context, params *domain.ModQuery) (*[]domain.ModResponse, int64, error) {
	ctx, cancel := context.WithTimeout(c, m.timeout)
	defer cancel()

	return m.modRepo.GetMods(ctx, params)
}

func (m *modService) DeleteMod(c context.Context, id string) error {
	ctx, cancel := context.WithTimeout(c, m.timeout)
	defer cancel()

	modVersions, _, err := m.modVersionRepo.GetModVersions(ctx, id)
	if err != nil {
		return err
	}
	// 将字符串id转换为uint类型
	idUint, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		return err
	}
	//数据库删除
	if err := m.modRepo.DeleteMod(ctx, uint(idUint)); err != nil {
		return err
	}
	//删除文件
	for _, modVersion := range *modVersions {
		return utils.DeleteFile(modVersion.File.FileKey)
	}

	return nil
}

func (m *modService) UpdateMod(c context.Context, mod *domain.Mod) error {
	ctx, cancel := context.WithTimeout(c, m.timeout)
	defer cancel()

	return m.modRepo.UpdateMod(ctx, mod)
}
