package routes

import (
	"ModVerse/bootstrap"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/redis/go-redis/v9"
	mail "github.com/xhit/go-simple-mail/v2"
	"gorm.io/gorm"
)

func Setup(r *fiber.App, db *gorm.DB, redis *redis.Client,
	mail *mail.SMTPClient, env *bootstrap.Env, timeout time.Duration) {

	api := r.Group("/api")

	NewGameRoute(api, db, redis, timeout)
	NewUserRoute(api, db, redis, timeout, env)
	NewCategoriesRoute(api, db, redis, timeout, env)
	NewUploadRoute(api, db, timeout, env)
	NewAuthRoute(api, db, redis, timeout, env, mail)
	NewModRoute(api, db, redis, timeout, env)
	NewCommentRoute(api, db, redis, timeout, env)
	NewModVersionRoute(api, db, redis, timeout, env)
	NewModFavoriteRoute(api, db, redis, timeout, env)
	NewModLikeRoute(api, db, redis, timeout, env)
	NewReportRoute(api, db, redis, timeout, env)
	NewCaptchaRoute(api, redis)
}
