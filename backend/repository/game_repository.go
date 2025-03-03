package repository

import (
	"ModVerse/domain"
	"ModVerse/internal/utils"
	"context"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type gameRepository struct {
	DB *gorm.DB
}

func NewGameRepository(db *gorm.DB) domain.GameRepository {
	return &gameRepository{
		DB: db,
	}
}

func (r *gameRepository) CreateGame(c context.Context, game *domain.Game) error {
	if err := r.DB.WithContext(c).Create(game).Error; err != nil {
		return err
	}
	return nil
}

func (r *gameRepository) GetGame(c context.Context, id string) (*domain.GameResponse, error) {
	var game domain.GameResponse

	if err := r.DB.WithContext(c).
		Model(&domain.Game{}).
		Preload("LogoFile", func(db *gorm.DB) *gorm.DB {
			return db.Model(&domain.StorageFile{}).Select("id, url")
		}).
		First(&game, id).Error; err != nil {
		return nil, err
	}

	return &game, nil
}

func (r *gameRepository) GetGames(c context.Context, params *domain.GameQuery) (*[]domain.GameResponse, int64, error) {
	var apiGames []domain.GameResponse
	var total int64
	gameAllowedFields := map[string]struct{}{
		"name":     {},
		"mod_nums": {},
		"publishers": {},
		"developers":{},
		"release_time":{},
	}

	query := r.DB.WithContext(c).Model(&domain.Game{})

	if params.Name != "" {
		query = query.Where("name LIKE ?", "%"+utils.EscapeLike(params.Name)+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if total == 0 {
		return &[]domain.GameResponse{}, 0, nil
	}

	sortField := utils.SafeSortField(params.Sort, gameAllowedFields, "name")
	orderDirection := utils.SafeOrderDirection(params.Order)

	query = query.Order(clause.OrderByColumn{
		Column: clause.Column{Name: sortField},
		Desc:   orderDirection == "desc",
	})

	query = utils.ApplyPaging(query, params.Page, params.PageSize)

	if err := query.
		Preload("LogoFile", func(db *gorm.DB) *gorm.DB {
			return db.Model(&domain.StorageFile{}).Select("id, url")
		}).
		Find(&apiGames).Error; err != nil {
		return nil, 0, err
	}
	return &apiGames, total, nil
}

func (r *gameRepository) DeleteGame(c context.Context, id string) error {
	return r.DB.WithContext(c).Delete(&domain.Game{}, id).Error
}

func (r *gameRepository) UpdateGame(c context.Context, game *domain.Game) error {
	return r.DB.WithContext(c).Model(game).Updates(game).Error
}
