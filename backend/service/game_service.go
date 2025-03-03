package service

import (
	"ModVerse/domain"
	"ModVerse/internal/utils"
	"context"
	"fmt"
	"strconv"
	"time"
)

type gameService struct {
	gameRepo  domain.GameRepository
	redisRepo domain.RedisRepository
	sfRepo    domain.StorageFileRepository
	timeout   time.Duration
}

func NewGameService(r domain.GameRepository, rd domain.RedisRepository, sf domain.StorageFileRepository, t time.Duration) domain.GameService {
	return &gameService{
		gameRepo:  r,
		redisRepo: rd,
		sfRepo:    sf,
		timeout:   t,
	}
}

func (s *gameService) CreateGame(c context.Context, game *domain.Game) error {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	return s.gameRepo.CreateGame(ctx, game)
}

func (s *gameService) GetGame(c context.Context, id string) (*domain.GameResponse, error) {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	game, err := s.gameRepo.GetGame(ctx, id)
	if err != nil {
		return nil, err
	}
	return game, nil
}

func (s *gameService) GetGames(c context.Context, params *domain.GameQuery) (*[]domain.GameResponse, int64, error) {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	games, total, err := s.gameRepo.GetGames(ctx, params)
	if err != nil {
		return nil, 0, err
	}
	return games, total, nil
}

func (s *gameService) DeleteGame(c context.Context, id string) error {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	game, err := s.gameRepo.GetGame(ctx, id)
	if err != nil {
		return err
	}

	if err := s.gameRepo.DeleteGame(ctx, id); err != nil {
		return err
	}

	file, err := s.sfRepo.GetStorageFile(ctx, fmt.Sprint(game.LogoID))
	if err != nil {
		return err
	}

	if err := s.sfRepo.DeleteStorageFile(ctx, fmt.Sprint(game.LogoID)); err != nil {
		return err
	}

	if err := utils.DeleteFile(file.FileKey); err != nil {
		return err
	}

	return nil
}

func (s *gameService) UpdateGame(c context.Context, id string, req *domain.UpdateGameRequest) error {
	game := domain.Game{
		Name:        req.Name,
		ReleaseTime: req.ReleaseTime,
		LogoID:      req.NewLogoID,
		Publishers:  req.Publishers,
		Developers:  req.Developers,
	}

	parseID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		return err
	}
	game.ID = uint(parseID)

	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	if err := s.gameRepo.UpdateGame(ctx, &game); err != nil {
		return err
	}

	if req.OldLogoID != 0 && req.NewLogoID != req.OldLogoID {
		oldLogoFile, err := s.sfRepo.GetStorageFile(ctx, fmt.Sprint(req.OldLogoID))
		if err != nil {
			return err
		}

		if err := s.sfRepo.DeleteStorageFile(ctx, fmt.Sprint(req.OldLogoID)); err != nil {
			return err
		}

		if err := utils.DeleteFile(oldLogoFile.FileKey); err != nil {
			return err
		}
	}

	return nil
}
