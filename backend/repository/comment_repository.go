package repository

import (
	"ModVerse/domain"
	"ModVerse/internal/utils"
	"context"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type commentRepository struct {
	DB *gorm.DB
}

func NewCommentRepository(db *gorm.DB) domain.CommentRepository {
	return &commentRepository{
		DB: db,
	}
}

func (r *commentRepository) CreateComment(c context.Context, comment *domain.Comment) error {
	return r.DB.WithContext(c).Create(comment).Error
}

func (r *commentRepository) DeleteComment(c context.Context, id string) error {
	return r.DB.WithContext(c).Delete(&domain.Comment{}, id).Error
}

func (r *commentRepository) GetCommentsWithReplies(c context.Context, modID string) (*[]domain.CommentResponse, int64, error) {
	var comments []domain.CommentResponse
	var total int64

	query := r.DB.WithContext(c).Model(&domain.Comment{}).Where("parent_id = 0").Where("mod_id = ?", modID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Joins("User.UserProfile.AvatarFile").
		Preload("Replies", func(db *gorm.DB) *gorm.DB {
			return db.Model(&domain.Comment{}).Joins("User.UserProfile.AvatarFile").Order("created_at DESC")
		}).
		Order("created_at DESC").
		Find(&comments).Error; err != nil {
		return nil, 0, err
	}

	return &comments, total, nil
}

func (r *commentRepository) GetAllComments(c context.Context, params domain.CommentQuery) (*[]domain.CommentResponse, int64, error) {
	var comments []domain.CommentResponse
	var total int64

	commentsAllowedFields := map[string]struct{}{
		"created_at": {},
		"name":       {},
	}

	query := r.DB.WithContext(c).Model(&domain.Comment{}).Joins("User")

	if params.Content != "" {
		query = query.Where("content LIKE ?", "%"+utils.EscapeLike(params.Content)+"%")
	}

	if params.UserName != "" {
		query = query.Where("user.user_name = ?", params.UserName)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if total == 0 {
		return &[]domain.CommentResponse{}, 0, nil
	}

	sortField := utils.SafeSortField(params.Sort, commentsAllowedFields, "created_at")
	orderDirection := utils.SafeOrderDirection(params.Order)

	query = query.Order(clause.OrderByColumn{
		Column: clause.Column{Name: sortField},
		Desc:   orderDirection == "desc",
	})

	query = utils.ApplyPaging(query, params.Page, params.PageSize)

	if err := query.Model(&domain.Comment{}).Find(&comments).Error; err != nil {
		return nil, 0, err
	}

	return &comments, total, nil
}

func (r *commentRepository) GetCommentByID(c context.Context, id string) (*domain.CommentResponse, error) {
	var comment domain.CommentResponse
	err := r.DB.WithContext(c).Model(&domain.Comment{}).Joins("User").Where("comments.id = ?", id).First(&comment).Error
	if err != nil {
		return nil, err
	}
	return &comment, nil
}
