package domain

import "context"

//用户登录请求
type LoginRequest struct {
	UserName    string `json:"username" validate:"required,max=30"`
	Password    string `json:"password" validate:"required,max=20"`
	CaptchaID   string `json:"captcha_id" validate:"required"`
	CaptchaCode string `json:"captcha_code" validate:"required"`
}

type LoginAdminRequest struct {
	UserName string `json:"username" validate:"required,max=30"`
	Password string `json:"password" validate:"required,max=20"`
}

//用户注册请求
type RegisterRequest struct {
	UserName        string `json:"username" validate:"required,max=20,min=4"`
	Email           string `json:"email" validate:"required,email,max=30"`
	Password        string `json:"password" validate:"required,max=20"`
	ConfirmPassword string `json:"confirm_password" validate:"required,eqfield=Password,max=20"`
	Code            string `json:"code" validate:"required,max=10"`
}

type VerifyRequest struct {
	Email string `json:"email" validate:"required,email,max=30"`
}

type UpdatePasswordRequest struct {
	Token           string `json:"token" validate:"required"`
	Password        string `json:"password" validate:"required,max=20"`
	ConfirmPassword string `json:"confirm_password" validate:"required,eqfield=Password,max=20"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" validate:"required,max=20"`
	NewPassword string `json:"new_password" validate:"required,max=20"`
}

type AuthService interface {
	Register(c context.Context, r *RegisterRequest) error
	Login(c context.Context, username string, password string) (map[string]string, error)
	SendVerificationEmail(c context.Context, email string) error
	SendResetEmail(c context.Context, email string) error
	RefreshToken(token string) (map[string]string, error)
	ResetPassword(c context.Context, token string, password string) error
	UpdateLoginTime(c context.Context, id string) error
	ChangePassword(c context.Context, id string, request *ChangePasswordRequest) error
}
