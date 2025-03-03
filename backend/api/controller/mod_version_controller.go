package controller

import (
	"ModVerse/domain"

	"github.com/gofiber/fiber/v3"
)

type ModVersionController struct {
	ModVersionService domain.ModVersionService
}

func (mc *ModVersionController) GetModVersions(c fiber.Ctx) error {
	modVersion, total, err := mc.ModVersionService.GetModVersions(c.Context(), c.Params("mod_id"))
	if err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(fiber.Map{
		"list":  modVersion,
		"total": total,
	}))
}

func (mc *ModVersionController) CreateModVersion(c fiber.Ctx) error {
	var requestBody domain.CreateModVersionRequest

	if err := c.Bind().Body(&requestBody); err != nil {
		c.Status(fiber.StatusBadRequest)
		return err
	}

	modVersion := domain.ModVersion{
		ModID:     requestBody.ModID,
		Version:   requestBody.Version,
		ChangeLog: requestBody.ChangeLog,
		FileID:    requestBody.FileID,
	}

	if err := mc.ModVersionService.CreateModVersion(c.Context(), &modVersion); err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(nil))
}

func (mc *ModVersionController) DeleteModVersion(c fiber.Ctx) error {
	if err := mc.ModVersionService.DeleteModVersion(c.Context(), c.Params("id")); err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(nil))
}

func (mc *ModVersionController) UpdateCount(c fiber.Ctx) error {
	count, err := mc.ModVersionService.UpdateCount(c.Context(), c.Params("id"), c.Params("mod_id"))

	if err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(count))
}