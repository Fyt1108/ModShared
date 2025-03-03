package routes

import (
	"ModVerse/api/controller"
	"ModVerse/api/middleware"
	"ModVerse/bootstrap"
	"ModVerse/repository"
	"ModVerse/service"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/redis/go-redis/v9"
	mail "github.com/xhit/go-simple-mail/v2"
	"gorm.io/gorm"
)

func NewAuthRoute(r fiber.Router, db *gorm.DB, redis *redis.Client,
	timeout time.Duration, env *bootstrap.Env, mail *mail.SMTPClient) {
	ur := repository.NewUserRepository(db)
	rr := repository.NewRedisRepository(redis)

	as := service.NewAuthService(ur, rr, timeout, env, mail)

	uc := controller.AuthController{
		AuthService: as,
		Env:         env,
	}

	auth := r.Group("/auth")

	auth.Post("/login", uc.Login)
	auth.Post("/register", uc.Register)
	auth.Post("/verify", uc.SendVerificationEmail)
	auth.Post("/send_reset_email", uc.SendResetEmail)
	auth.Get("/refresh_token", uc.RefreshToken)
	auth.Put("/reset_password", uc.ResetPassword)
	auth.Get("/is_login", uc.IsLogin, middleware.AuthMiddleware(env))
	auth.Put("/update_password", uc.ChangePassword, middleware.AuthMiddleware(env))
	auth.Post("/login/admin", uc.LoginAdmin)
}
