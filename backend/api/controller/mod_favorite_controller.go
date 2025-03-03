package controller

import (
	"ModVerse/domain"
	"errors"
	"strconv"

	"github.com/gofiber/fiber/v3"
)

type ModFavoriteController struct {
	ModFavoriteService domain.ModFavoriteService
}

func (mfc *ModFavoriteController) CreateModFavorite(c fiber.Ctx) error {
	var requestBody domain.CreateModFavoriteRequest
	if err := c.Bind().Body(&requestBody); err != nil {
		c.Status(fiber.StatusBadRequest)
		return err
	}

	id, ok := c.Locals("id").(string)
	if !ok {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(domain.ErrorResponse(errors.New("assertion failed")))
	}

	parseID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		return err
	}

	modFavorite := domain.ModFavorite{
		ModID:  requestBody.ModID,
		UserID: parseID,
	}

	if err := mfc.ModFavoriteService.CreateModFavorite(c.Context(), &modFavorite); err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(nil))
}

func (mfc *ModFavoriteController) DeleteModFavorite(c fiber.Ctx) error {
	id, ok := c.Locals("id").(string)
	if !ok {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(domain.ErrorResponse(errors.New("assertion failed")))
	}

	if err := mfc.ModFavoriteService.DeleteModFavorite(c.Context(), id, c.Params("modID")); err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(nil))
}

func (mfc *ModFavoriteController) GetModFavorites(c fiber.Ctx) error {
	var queryBody domain.ModFavoriteQuery

	if err := c.Bind().Query(&queryBody); err != nil {
		c.Status(fiber.StatusBadRequest)
		return err
	}

	id, ok := c.Locals("id").(string)
	if !ok {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(domain.ErrorResponse(errors.New("assertion failed")))
	}

	modVersion, total, err := mfc.ModFavoriteService.GetModFavorites(c.Context(), id, &queryBody)
	if err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(fiber.Map{
		"list":  modVersion,
		"total": total,
	}))
}

func (mfc *ModFavoriteController) CheckIsFavorite(c fiber.Ctx) error {
	modID := c.Query("mod_id")

	id, ok := c.Locals("id").(string)
	if !ok {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(domain.ErrorResponse(errors.New("assertion failed")))
	}

	check, err := mfc.ModFavoriteService.CheckIsFavorite(c.Context(), id, modID)
	if err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(check))
}
