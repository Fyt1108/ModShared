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
	"gorm.io/gorm"
)

func NewModLikeRoute(r fiber.Router, db *gorm.DB, redis *redis.Client, timeout time.Duration, env *bootstrap.Env) {
	mlr := repository.NewModLikeRepository(db)
	rr := repository.NewRedisRepository(redis)
	mls := service.NewModLikeService(mlr, rr, timeout)
	mlc := controller.ModLikeController{
		ModLikeService: mls,
	}

	modLike := r.Group("/mod/:id/likes")
	modLike.Post("/", mlc.LikeMod, middleware.AuthMiddleware(env))
	modLike.Delete("/", mlc.UnlikeMod, middleware.AuthMiddleware(env))
	modLike.Get("/", mlc.GetLikeStatus, middleware.AuthMiddleware(env))
}
