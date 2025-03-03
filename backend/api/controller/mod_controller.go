package controller

import (
	"ModVerse/domain"
	"errors"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v3"
)

type ModController struct {
	ModService domain.ModService
}

func (mc *ModController) CreateMod(c fiber.Ctx) error {
	var requestBody domain.CreateModRequest

	if err := c.Bind().Body(&requestBody); err != nil {
		c.Status(fiber.StatusBadRequest)
		return err
	}

	id, ok := c.Locals("id").(string)
	if !ok {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(domain.ErrorResponse(errors.New("assertion failed")))
	}

	//id转为uint64类型
	parseID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		return err
	}

	mod := domain.Mod{
		Name:        requestBody.Name,
		Description: requestBody.Description,
		Content:     requestBody.Content,
		Category:    requestBody.Category,
		CoverID:     requestBody.CoverID,
		UserID:      parseID,
		GameID:      requestBody.GameID,
		LastUpdate:  time.Now(),
	}

	modVersion := domain.ModVersion{
		FileID:    requestBody.FileID,
		Version:   requestBody.Version,
		ChangeLog: "首次发布",
	}

	if err := mc.ModService.CreateMod(c.Context(), &mod, &modVersion, id); err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(nil))
}

func (mc *ModController) GetMod(c fiber.Ctx) error {
	mod, err := mc.ModService.GetMod(c.Context(), c.Params("id"))
	if err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(mod))
}

func (mc *ModController) GetMods(c fiber.Ctx) error {
	var queryBody domain.ModQuery
	if err := c.Bind().Query(&queryBody); err != nil {
		c.Status(fiber.StatusBadRequest)
		return err
	}

	mods, total, err := mc.ModService.GetMods(c.Context(), &queryBody)
	if err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(fiber.Map{
		"list":  mods,
		"total": total,
	},
	))
}

func (mc *ModController) DeleteMod(c fiber.Ctx) error {
	if err := mc.ModService.DeleteMod(c.Context(), c.Params("id")); err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(nil))
}

func (mc *ModController) UpdateMod(c fiber.Ctx) error {
	var requestBody domain.UpdateModRequest

	if err := c.Bind().Body(&requestBody); err != nil {
		c.Status(fiber.StatusBadRequest)
		return err
	}

	var mod = domain.Mod{
		Description: requestBody.Description,
		Content:     requestBody.Content,
		Status:      requestBody.Status,
	}

	id := c.Params("id")
	parseID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		return err
	}

	mod.ID = uint(parseID)

	if err := mc.ModService.UpdateMod(c.Context(), &mod); err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(nil))
}
