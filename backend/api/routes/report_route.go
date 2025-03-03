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

func NewReportRoute(r fiber.Router, db *gorm.DB, redis *redis.Client, timeout time.Duration, env *bootstrap.Env) {
	// 创建依赖注入链
	rr := repository.NewReportRepository(db)
	rer := repository.NewRedisRepository(redis)
	rs := service.NewReportService(rr, rer, timeout)
	rc := controller.ReportController{ReportService: rs}
	// 举报相关路由
	report := r.Group("/report")
	report.Post("/", rc.CreateReport, middleware.AuthMiddleware(env))
	report.Get("/", rc.GetReports, middleware.AuthMiddleware(env))
	report.Get("/:id", rc.GetReport, middleware.AuthMiddleware(env))
	report.Put("/:id", rc.UpdateReport, middleware.AuthMiddleware(env))
	report.Delete("/:id", rc.DeleteReport, middleware.AuthMiddleware(env))
}
