package controller

import (
	"ModVerse/domain"
	"errors"
	"strconv"

	"github.com/gofiber/fiber/v3"
)

type UserController struct {
	UserService domain.UserService
}

func (uc *UserController) GetUser(c fiber.Ctx) error {
	id := c.Params("id")
	withMod := c.Query("withMod")

	if withMod == "true" {
		user, err := uc.UserService.GetUserWithMod(c.Context(), id)
		if err != nil {
			return err
		}
		return c.JSON(domain.SuccessResponse(user))
	} else {
		user, err := uc.UserService.GetUserByID(c.Context(), id)
		if err != nil {
			return err
		}
		return c.JSON(domain.SuccessResponse(user))
	}
}

func (uc *UserController) GetUserBySelf(c fiber.Ctx) error {
	id, ok := c.Locals("id").(string)
	if !ok {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(domain.ErrorResponse(errors.New("assertion failed")))
	}

	withMod := c.Query("withMod")

	if withMod == "true" {
		user, err := uc.UserService.GetUserWithMod(c.Context(), id)
		if err != nil {
			return err
		}
		return c.JSON(domain.SuccessResponse(user))
	} else {
		user, err := uc.UserService.GetUserByID(c.Context(), id)
		if err != nil {
			return err
		}
		return c.JSON(domain.SuccessResponse(user))
	}
}

func (uc *UserController) GetUserByNameWithMod(c fiber.Ctx) error {
	name := c.Params("name")

	user, err := uc.UserService.GetUserByNameWithMod(c.Context(), name)
	if err != nil {
		return err
	}
	return c.JSON(domain.SuccessResponse(user))
}

func (uc *UserController) UpdateUserProfile(c fiber.Ctx) error {
	var requestBody domain.UpdateUserProfileRequest
	if err := c.Bind().Body(&requestBody); err != nil {
		c.Status(fiber.StatusBadRequest)
		return err
	}

	id, ok := c.Locals("id").(string)
	if !ok {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(domain.ErrorResponse(errors.New("assertion failed")))
	}

	if err := uc.UserService.UpdateProfile(c.Context(), &requestBody, id); err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(nil))
}

func (uc *UserController) GetUsers(c fiber.Ctx) error {
	var queryBody domain.UserQuery
	if err := c.Bind().Query(&queryBody); err != nil {
		c.Status(fiber.StatusBadRequest)
		return err
	}

	users, total, err := uc.UserService.GetUsers(c.Context(), &queryBody)
	if err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(fiber.Map{
		"list":  users,
		"total": total,
	}))
}

func (uc *UserController) DeleteUser(c fiber.Ctx) error {
	// role, ok := c.Locals("role").(string)
	// if !ok {
	// 	c.Status(fiber.StatusUnauthorized)
	// 	return c.JSON(domain.ErrorResponse(errors.New("assertion failed")))
	// }

	// if role != "admin" {
	// 	c.Status(fiber.StatusUnauthorized)
	// 	return c.JSON(domain.ErrorResponse(errors.New("unauthorized")))
	// }

	err := uc.UserService.DeleteUser(c.Context(), c.Params("id"))
	if err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(nil))
}

func (uc *UserController) UpdateUserState(c fiber.Ctx) error {
	var requestBody domain.UpdateUserStateRequest

	role, ok := c.Locals("role").(string)
	if !ok {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(domain.ErrorResponse(errors.New("assertion failed")))
	}

	if role != "admin" {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(domain.ErrorResponse(errors.New("unauthorized")))
	}

	if err := c.Bind().Body(&requestBody); err != nil {
		c.Status(fiber.StatusBadRequest)
		return err
	}

	id := c.Params("id")
	parseID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		return err
	}

	user := domain.User{
		Status: requestBody.Status,
		Role:   requestBody.Role,
	}

	user.ID = parseID

	if err := uc.UserService.UpdateUserState(c.Context(), &user); err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(nil))
}
