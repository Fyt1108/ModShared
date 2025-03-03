package service

import (
	"ModVerse/domain"
	"context"
	"time"
)

type categoriesService struct {
	caRepo    domain.CategoriesRepository
	redisRepo domain.RedisRepository
	timeout   time.Duration
}

func NewCategoriesService(ca domain.CategoriesRepository, rd domain.RedisRepository, t time.Duration) domain.CategoriesService {
	return &categoriesService{
		caRepo:    ca,
		redisRepo: rd,
		timeout:   t,
	}
}

func (s *categoriesService) AddCategories(c context.Context, ca *domain.Categories) error {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	if err := s.caRepo.AddCategories(ctx, ca); err != nil {
		return err
	}

	// if err := s.redisRepo.AddItem(ctx, "categories", ca.Name); err != nil {
	// 	return err
	// }

	return nil
}

func (s *categoriesService) DeleteCategories(c context.Context, id string) error {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	// ca, err := s.caRepo.GetCategoriesByID(ctx, id)
	// if err != nil {
	// 	return err
	// }

	// if err := s.redisRepo.RemoveItem(ctx, "categories", ca.Name); err != nil {
	// 	return err
	// }

	if err := s.caRepo.DeleteCategories(ctx, id); err != nil {
		return err
	}

	return nil
}

func (s *categoriesService) GetCategories(c context.Context, params *domain.CategoriesQuery) (*[]domain.CategoriesResponse, int64, error) {
	return s.caRepo.GetCategories(c, params)
}

func (s *categoriesService) UpdateCategories(c context.Context, ca *domain.Categories) error {
	return s.caRepo.UpdateCategories(c, ca)
}
