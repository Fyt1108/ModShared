package routes

import (
	"ModVerse/api/controller"
	"ModVerse/bootstrap"
	"ModVerse/repository"
	"ModVerse/service"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

func NewCategoriesRoute(r fiber.Router, db *gorm.DB, redis *redis.Client, timeout time.Duration, env *bootstrap.Env) {
	cr := repository.NewCategoriesRepository(db)
	rr := repository.NewRedisRepository(redis)
	cs := service.NewCategoriesService(cr, rr, timeout)
	cc := controller.CategoriesController{
		CategoriesService: cs,
	}

	categories := r.Group("/categories")

	categories.Get("/", cc.GetCategories)
	categories.Post("/", cc.CreateCategory)
	categories.Put("/:id", cc.UpdateCategory)
	categories.Delete("/:id", cc.DeleteCategory)
}
