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

func NewModFavoriteRoute(r fiber.Router, db *gorm.DB, redis *redis.Client, timeout time.Duration, env *bootstrap.Env) {
	mfr := repository.NewModFavoriteRepository(db)
	rr := repository.NewRedisRepository(redis)
	mfs := service.NewModFavoriteService(mfr, rr, timeout)

	mfc := controller.ModFavoriteController{
		ModFavoriteService: mfs,
	}

	modFavorite := r.Group("/mod_favorite")
	modFavorite.Get("/", mfc.GetModFavorites, middleware.AuthMiddleware(env))
	modFavorite.Post("/", mfc.CreateModFavorite, middleware.AuthMiddleware(env))
	modFavorite.Delete("/:modID", mfc.DeleteModFavorite, middleware.AuthMiddleware(env))
	modFavorite.Get("/check", mfc.CheckIsFavorite, middleware.AuthMiddleware(env))
}
