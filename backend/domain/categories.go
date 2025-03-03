package domain

import (
	"context"
	"time"

	"gorm.io/gorm"
)

type Categories struct {
	gorm.Model
	Name   string `gorm:"index;size:128;not null" json:"name"`
	Status string `gorm:"default:'enable';index;size:32;not null" json:"status"`
}

type CreateCategoriesRequest struct {
	Name   string `json:"name" validate:"required"`
	Status string `json:"status"`
}

type UpdateCategoriesRequest struct {
	Name   string `json:"name"`
	Status string `json:"status"`
}

type CategoriesResponse struct {
	ID        uint      `json:"id"`
	Name      string    `json:"name"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

type CategoriesQuery struct {
	Paging
	Name   string `json:"name"`
	Status string `json:"status"`
}

type CategoriesRepository interface {
	GetCategories(c context.Context, params *CategoriesQuery) (*[]CategoriesResponse, int64, error)
	GetCategoriesByID(c context.Context, id string) (*CategoriesResponse, error)
	AddCategories(c context.Context, ca *Categories) error
	DeleteCategories(c context.Context, id string) error
	UpdateCategories(c context.Context, ca *Categories) error
}

type CategoriesService interface {
	GetCategories(c context.Context, params *CategoriesQuery) (*[]CategoriesResponse, int64, error)
	AddCategories(c context.Context, ca *Categories) error
	DeleteCategories(c context.Context, id string) error
	UpdateCategories(c context.Context, ca *Categories) error
}
