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

func NewModRoute(r fiber.Router, db *gorm.DB, redis *redis.Client, time time.Duration, env *bootstrap.Env) {
	mr := repository.NewModRepository(db)
	rr := repository.NewRedisRepository(redis)
	mvr := repository.NewModVersionRepository(db)
	ms := service.NewModService(mr, mvr, rr, time)
	mc := controller.ModController{
		ModService: ms,
	}

	mod := r.Group("/mod")
	mod.Post("/", mc.CreateMod, middleware.AuthMiddleware(env))
	mod.Get("/:id", mc.GetMod)
	mod.Get("/", mc.GetMods)
	mod.Delete("/:id", mc.DeleteMod, middleware.AuthMiddleware(env))
	mod.Put("/:id", mc.UpdateMod, middleware.AuthMiddleware(env))
}
