package controller

import (
	"ModVerse/bootstrap"
	"ModVerse/domain"
	"ModVerse/internal/custom"
	"ModVerse/internal/utils"
	"errors"

	"github.com/gofiber/fiber/v3"
)

type AuthController struct {
	AuthService domain.AuthService
	Env         *bootstrap.Env
}

func (ac *AuthController) Register(c fiber.Ctx) error {
	var requestBody domain.RegisterRequest

	if err := c.Bind().Body(&requestBody); err != nil {
		c.Status(fiber.StatusBadRequest)
		return err
	}

	if err := ac.AuthService.Register(c.Context(), &requestBody); err != nil {
		return err
	}

	return c.Status(fiber.StatusCreated).JSON(domain.SuccessResponse(nil))
}

func (ac *AuthController) Login(c fiber.Ctx) error {
	if c.Get("Authorization") != "" {
		c.Status(fiber.StatusConflict)
		return c.JSON(domain.ErrorResponse(custom.LoginRepeatError))
	}
	var requestBody domain.LoginRequest

	if err := c.Bind().Body(&requestBody); err != nil {
		c.Status(fiber.StatusBadRequest)
		return err
	}

	if !utils.CaptchaStore.Verify(requestBody.CaptchaID, requestBody.CaptchaCode, true) {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(domain.ErrorResponse(custom.CodeInvalidError))
	}

	token, err := ac.AuthService.Login(c.Context(), requestBody.UserName, requestBody.Password)
	if err != nil {
		return err
	}

	c.Set("authorization", token["authorization"])
	c.Set("refreshtoken", token["refreshtoken"])
	return c.JSON(domain.SuccessResponse(nil))
}

func (ac *AuthController) LoginAdmin(c fiber.Ctx) error {
	var requestBody domain.LoginAdminRequest

	if err := c.Bind().Body(&requestBody); err != nil {
		c.Status(fiber.StatusBadRequest)
		return err
	}

	token, err := ac.AuthService.Login(c.Context(), requestBody.UserName, requestBody.Password)
	if err != nil {
		return err
	}

	_, role, err := utils.ParseJWT(token["authorization"], ac.Env.App.TokenSecret)
	if err != nil {
		return err
	}
	if role != "admin" {
		c.Status(fiber.StatusUnauthorized)
		return errors.New("not admin")
	}

	return c.JSON(domain.SuccessResponse(token["authorization"]))
}

func (ac *AuthController) SendVerificationEmail(c fiber.Ctx) error {
	var requestBody domain.VerifyRequest

	if err := c.Bind().Body(&requestBody); err != nil {
		c.Status(fiber.StatusBadRequest)
		return err
	}

	if err := ac.AuthService.SendVerificationEmail(c.Context(), requestBody.Email); err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(nil))

}

func (ac *AuthController) RefreshToken(c fiber.Ctx) error {
	token, err := ac.AuthService.RefreshToken(c.Get("Authorization"))
	if err != nil {
		c.Status(fiber.StatusUnauthorized)
		return err
	}

	c.Set("authorization", token["authorization"])
	c.Set("refreshtoken", token["refreshtoken"])
	return c.JSON(domain.SuccessResponse(nil))

}

func (ac *AuthController) ResetPassword(c fiber.Ctx) error {
	var requestBody domain.UpdatePasswordRequest

	if err := c.Bind().Body(&requestBody); err != nil {
		c.Status(fiber.StatusBadRequest)
		return err
	}
	if err := ac.AuthService.ResetPassword(c.Context(), requestBody.Token, requestBody.ConfirmPassword); err != nil {
		c.Status(fiber.StatusUnauthorized)
		return err
	}
	return c.JSON(domain.SuccessResponse(nil))

}

func (ac *AuthController) SendResetEmail(c fiber.Ctx) error {
	var requestBody domain.VerifyRequest

	if err := c.Bind().Body(&requestBody); err != nil {
		c.Status(fiber.StatusBadRequest)
		return err
	}
	if err := ac.AuthService.SendResetEmail(c.Context(), requestBody.Email); err != nil {
		return err
	}
	return c.JSON(domain.SuccessResponse(nil))

}

func (ac *AuthController) IsLogin(c fiber.Ctx) error {
	id, ok := c.Locals("id").(string)
	if !ok {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(domain.ErrorResponse(errors.New("assertion failed")))
	}

	if err := ac.AuthService.UpdateLoginTime(c.Context(), id); err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(true))
}

func (ac *AuthController) ChangePassword(c fiber.Ctx) error {
	id, ok := c.Locals("id").(string)
	if !ok {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(domain.ErrorResponse(errors.New("assertion failed")))
	}

	var requestBody domain.ChangePasswordRequest

	if err := c.Bind().Body(&requestBody); err != nil {
		c.Status(fiber.StatusBadRequest)
		return err
	}

	if err := ac.AuthService.ChangePassword(c.Context(), id, &requestBody); err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(nil))
}
