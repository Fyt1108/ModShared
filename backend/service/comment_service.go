package service

import (
	"ModVerse/domain"
	"context"
	"time"
)

type commentService struct {
	commentRepo domain.CommentRepository
	redisRepo   domain.RedisRepository
	timeout     time.Duration
}

func NewCommentService(rd domain.RedisRepository, cr domain.CommentRepository, t time.Duration) domain.CommentService {
	return &commentService{
		redisRepo:   rd,
		commentRepo: cr,
		timeout:     t,
	}
}

func (s *commentService) CreateComment(c context.Context, comment *domain.Comment) error {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	return s.commentRepo.CreateComment(ctx, comment)
}

func (s *commentService) DeleteComment(c context.Context, id string) error {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	return s.commentRepo.DeleteComment(ctx, id)
}

func (s *commentService) GetCommentsWithReplies(c context.Context, modID string) (*[]domain.CommentResponse, int64, error) {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	return s.commentRepo.GetCommentsWithReplies(ctx, modID)
}

func (s *commentService) GetAllComments(c context.Context, params domain.CommentQuery) (*[]domain.CommentResponse, int64, error) {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	return s.commentRepo.GetAllComments(ctx, params)
}

func (s *commentService) GetCommentByID(c context.Context, id string) (*domain.CommentResponse, error) {
	return s.commentRepo.GetCommentByID(c, id)
}
