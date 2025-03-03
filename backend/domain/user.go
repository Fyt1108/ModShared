package domain

import (
	"context"
	"time"
)

// 用户表
type User struct {
	Model
	UserName    string      `gorm:"size:64;uniqueIndex;not null;comment:用户名" json:"user_name"`
	Password    string      `gorm:"size:255;not null;comment:密码哈希值" json:"-"` // 禁止 JSON 输出
	Email       string      `gorm:"size:128;uniqueIndex;not null;comment:邮箱" json:"-"`
	Status      string      `gorm:"size:32;default:'enable';comment:状态(enable/disable)" json:"status"`
	Role        string      `gorm:"size:20;default:'user';comment:角色(user/admin)" json:"role"`
	LastLogin   time.Time   `gorm:"comment:上次登录时间;default:null" json:"last_login"`
	UserProfile UserProfile `json:"user_profile"`
	Mod         []Mod       `json:"mod"`
}

type UserResponse struct {
	ID          uint64                `json:"id"`
	UserName    string                `json:"user_name"`  //用户名
	Role        string                `json:"role"`       // 角色
	CreatedAt   time.Time             `json:"created_at"` // 加入时间
	UserProfile UserProfileResponse   `gorm:"foreignKey:UserID" json:"user_profile"`
	Mod         []ModResponseWithUser `gorm:"foreignKey:UserID" json:"mod"`
}

type UsersResponse struct {
	ID        uint64    `json:"id"`
	UserName  string    `json:"user_name"`  //用户名
	Role      string    `json:"role"`       // 角色
	CreatedAt time.Time `json:"created_at"` // 加入时间
	LastLogin time.Time `json:"last_login"` // 上次登录时间
	Email     string    `json:"email"`      // 邮箱
	Status    string    `json:"status"`
}

type UpdateUserStateRequest struct {
	Status string `json:"status"`
	Role   string `json:"role"`
}

// 用户查询参数
type UserQuery struct {
	Paging
	UserName string `json:"user_name"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	Status   string `json:"status"`
}

type UserRepository interface {
	CreateUser(c context.Context, user *User) error
	UpdatePassword(c context.Context, id string, password string) error
	UpdateLoginTime(c context.Context, id string, loginTime time.Time) error
	ReadUser(c context.Context, id string) (*UserResponse, error)
	ReadUserWithMod(c context.Context, id string) (*UserResponse, error)
	ReadUserByNameOrEmail(c context.Context, name string) (*User, error)
	ReadUserByNameWithMod(c context.Context, name string) (*UserResponse, error)
	ReadUsers(c context.Context, params *UserQuery) (*[]UsersResponse, int64, error)
	DeleteUser(c context.Context, id string) error
	UpdateUserState(c context.Context, user *User) error
	ReadUserAllInfo(c context.Context, id string) (*User, error)
}

type UserService interface {
	GetUserByID(c context.Context, id string) (*UserResponse, error)
	GetUserWithMod(c context.Context, id string) (*UserResponse, error)
	GetUserByNameWithMod(c context.Context, name string) (*UserResponse, error)
	UpdateProfile(c context.Context, profile *UpdateUserProfileRequest, id string) error
	GetUsers(c context.Context, params *UserQuery) (*[]UsersResponse, int64, error)
	DeleteUser(c context.Context, id string) error
	UpdateUserState(c context.Context, user *User) error
}
