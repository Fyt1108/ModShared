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

func NewCommentRoute(r fiber.Router, db *gorm.DB, redis *redis.Client, time time.Duration, env *bootstrap.Env) {
	cr := repository.NewCommentRepository(db)
	rr := repository.NewRedisRepository(redis)
	cs := service.NewCommentService(rr, cr, time)

	cc := controller.CommentController{
		CommentService: cs,
	}

	comment := r.Group("/comment")

	comment.Post("/", cc.CreateComment, middleware.AuthMiddleware(env))
	comment.Get("/mod/:mod_id", cc.GetCommentsWithReplies)
	comment.Delete("/:id", cc.DeleteComment, middleware.AuthMiddleware(env))
	comment.Get("/", cc.GetAllComments, middleware.AuthMiddleware(env))
	comment.Get("/:id", cc.GetCommentByID)
}
