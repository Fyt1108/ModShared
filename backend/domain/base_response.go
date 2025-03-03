package domain

import (
	"ModVerse/internal/custom"
	"errors"

	"github.com/gofiber/fiber/v3"
)

func SuccessResponse(data any) *fiber.Map {
	return &fiber.Map{
		"code":  custom.OK,
		"data":  data,
		"error": nil,
	}
}

func ErrorResponse(err error) *fiber.Map {

	var r *custom.CustomError
	if errors.As(err, &r) {
		return &fiber.Map{
			"code":  r.Code(),
			"data":  nil,
			"error": r.Error(),
		}
	}

	return &fiber.Map{
		"code":  custom.Unknown,
		"data":  nil,
		"error": err.Error(),
	}
}
