package routes

import (
	"ModVerse/api/controller"
	"ModVerse/api/middleware"
	"ModVerse/bootstrap"
	"ModVerse/repository"
	"ModVerse/service"
	"time"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func NewUploadRoute(r fiber.Router, db *gorm.DB, timeout time.Duration, env *bootstrap.Env) {
	ur := repository.NewStorageFileRepository(db)
	us := service.NewUploadService(ur, env, timeout)

	uc := controller.UploadController{
		UploadService: us,
	}

	upload := r.Group("/upload")

	upload.Post("/post_image", uc.UploadPostImage, middleware.AuthMiddleware(env))
	upload.Post("/file", uc.UploadFile, middleware.AuthMiddleware(env))

	upload.Get("/:id", uc.GetFile)
	upload.Get("/", uc.GetFiles)
	upload.Delete("/:id", uc.DeleteFile)
}
