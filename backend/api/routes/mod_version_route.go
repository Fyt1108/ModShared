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

func NewModVersionRoute(r fiber.Router, db *gorm.DB, redis *redis.Client, timeout time.Duration, env *bootstrap.Env) {
	mr := repository.NewModVersionRepository(db)
	rr := repository.NewRedisRepository(redis)
	ms := service.NewModVersionService(mr, rr, timeout)
	mc := controller.ModVersionController{
		ModVersionService: ms,
	}

	modVersion := r.Group("/mod_version")

	modVersion.Get("/:mod_id", mc.GetModVersions)
	modVersion.Post("/", mc.CreateModVersion, middleware.AuthMiddleware(env))
	modVersion.Delete("/:id", mc.DeleteModVersion, middleware.AuthMiddleware(env))
	modVersion.Post("count/:mod_id/:id", mc.UpdateCount)
}
