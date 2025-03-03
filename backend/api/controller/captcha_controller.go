package controller

import (
	"ModVerse/domain"
	"ModVerse/internal/utils"

	"github.com/gofiber/fiber/v3"
	"github.com/mojocn/base64Captcha"
)

type CaptchaController struct{}

func (cc *CaptchaController) GenerateView(c fiber.Ctx) error {
	var driver = base64Captcha.DriverString{
		Height:          40,
		Width:           150,
		NoiseCount:      2,
		ShowLineOptions: 3,
		Length:          4,
		Source:          "1234567890yusdfghjklzxbnm",
	}

	cp := base64Captcha.NewCaptcha(&driver, utils.CaptchaStore)
	id, b64s, _, err := cp.Generate()
	if err != nil {
		return err
	}
	return c.JSON(domain.SuccessResponse(domain.CaptchaResponse{
		CaptchaID: id,
		Captcha:   b64s,
	}))
}
