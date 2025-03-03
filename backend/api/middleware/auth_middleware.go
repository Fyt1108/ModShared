package middleware

import (
	"ModVerse/bootstrap"
	"ModVerse/domain"
	"ModVerse/internal/custom"
	"ModVerse/internal/utils"

	"github.com/gofiber/fiber/v3"
)

func AuthMiddleware(env *bootstrap.Env) fiber.Handler {
	return func(c fiber.Ctx) error {
		token := c.Get("Authorization")
		if token == "" {
			c.Status(fiber.StatusUnauthorized)
			return c.JSON(domain.ErrorResponse(custom.TokenInvalidError))
		}

		id, role, err := utils.ParseJWT(token, env.App.TokenSecret) //解析token
		if err != nil {
			c.Status(fiber.StatusUnauthorized)
			return c.JSON(domain.ErrorResponse(custom.TokenInvalidError))
		}

		c.Locals("id", id) //存储在上下文中
		c.Locals("role", role)
		return c.Next()
	}
}
