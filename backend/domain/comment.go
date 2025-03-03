package domain

import (
	"context"
	"time"

	"gorm.io/gorm"
)

type Comment struct {
	gorm.Model
	Content  string    `gorm:"type:text;not null"`  // 评论内容
	UserID   uint64    `gorm:"index;not null"`      // 用户ID
	ParentID uint      `gorm:"index"`               // 父评论ID（0表示顶级评论）
	ModID    uint      `gorm:"index;not null"`      // 所属模组ID
	User     User      `gorm:"foreignKey:UserID"`   // 所属用户
	Replies  []Comment `gorm:"foreignKey:ParentID"` // 子回复
}

type CommentResponse struct {
	ID        uint              `json:"id"`
	Content   string            `json:"content"`
	UserID    uint64            `json:"-"`
	User      UserResponse      `gorm:"foreignKey:UserID" json:"user"`
	CreatedAt time.Time         `json:"created_at"`
	ParentID  uint              `json:"-"`
	Replies   []CommentResponse `gorm:"foreignKey:ParentID" json:"replies"`
}

type CreateCommentRequest struct {
	Content  string `json:"content" validate:"required"`
	ParentID uint   `json:"parent_id"`
	ModID    uint   `json:"mod_id" validate:"required"`
}

type CommentQuery struct {
	Paging
	Content  string
	UserName string
}

type CommentRepository interface {
	CreateComment(c context.Context, comment *Comment) error
	GetCommentsWithReplies(c context.Context, modID string) (*[]CommentResponse, int64, error)
	DeleteComment(c context.Context, id string) error
	GetAllComments(c context.Context, params CommentQuery) (*[]CommentResponse, int64, error)
	GetCommentByID(c context.Context, id string) (*CommentResponse, error)
}

type CommentService interface {
	CreateComment(c context.Context, comment *Comment) error
	GetCommentsWithReplies(c context.Context, modID string) (*[]CommentResponse, int64, error)
	DeleteComment(c context.Context, id string) error
	GetAllComments(c context.Context, params CommentQuery) (*[]CommentResponse, int64, error)
	GetCommentByID(c context.Context, id string) (*CommentResponse, error)
}
