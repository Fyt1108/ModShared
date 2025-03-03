package routes

import (
	"ModVerse/api/controller"

	"github.com/gofiber/fiber/v3"
	"github.com/redis/go-redis/v9"
)

func NewCaptchaRoute(r fiber.Router, redis *redis.Client) {
	cc := controller.CaptchaController{}

	captcha := r.Group("/captcha")

	captcha.Get("/", cc.GenerateView)
}
