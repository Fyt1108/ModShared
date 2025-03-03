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

func NewUserRoute(r fiber.Router, db *gorm.DB, redis *redis.Client, timeout time.Duration, env *bootstrap.Env) {
	ur := repository.NewUserRepository(db)
	rr := repository.NewRedisRepository(redis)
	pr := repository.NewUserProfileRepository(db)
	sfr := repository.NewStorageFileRepository(db)

	us := service.NewUserService(ur, rr, pr, timeout, env, sfr)

	uc := controller.UserController{
		UserService: us,
	}

	user := r.Group("/user")

	user.Get("/:id", uc.GetUser)
	user.Get("/my/profile", uc.GetUserBySelf, middleware.AuthMiddleware(env))
	user.Get("/name/:name", uc.GetUserByNameWithMod)
	user.Put("/profile", uc.UpdateUserProfile, middleware.AuthMiddleware(env))
	user.Get("/", uc.GetUsers)
	user.Delete("/:id", uc.DeleteUser, middleware.AuthMiddleware(env))
	user.Put("/state/:id", uc.UpdateUserState, middleware.AuthMiddleware(env))
}
