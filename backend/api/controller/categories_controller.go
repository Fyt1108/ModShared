package controller

import (
	"ModVerse/domain"
	"strconv"

	"github.com/gofiber/fiber/v3"
)

type CategoriesController struct {
	CategoriesService domain.CategoriesService
}

func (cc *CategoriesController) GetCategories(c fiber.Ctx) error {
	var queryBody domain.CategoriesQuery
	if err := c.Bind().Query(&queryBody); err != nil {
		c.Status(fiber.StatusBadRequest)
		return err
	}

	categories, total, err := cc.CategoriesService.GetCategories(c.Context(), &queryBody)
	if err != nil {
		return err
	}
	return c.JSON(domain.SuccessResponse(fiber.Map{
		"list":  categories,
		"total": total,
	}))
}

func (cc *CategoriesController) CreateCategory(c fiber.Ctx) error {
	var requestBody domain.CreateCategoriesRequest
	if err := c.Bind().Body(&requestBody); err != nil {
		c.Status(fiber.StatusBadRequest)
		return err
	}

	categories := domain.Categories{
		Name:   requestBody.Name,
		Status: requestBody.Status,
	}

	if err := cc.CategoriesService.AddCategories(c.Context(), &categories); err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(nil))
}

func (cc *CategoriesController) DeleteCategory(c fiber.Ctx) error {
	id := c.Params("id")

	if err := cc.CategoriesService.DeleteCategories(c.Context(), id); err != nil {
		return err
	}
	return c.JSON(domain.SuccessResponse(nil))
}

func (cc *CategoriesController) UpdateCategory(c fiber.Ctx) error {
	id := c.Params("id")

	var requestBody domain.UpdateCategoriesRequest
	if err := c.Bind().Body(&requestBody); err != nil {
		c.Status(fiber.StatusBadRequest)
		return err
	}

	categories := domain.Categories{
		Name:   requestBody.Name,
		Status: requestBody.Status,
	}

	parseID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		return err
	}

	categories.ID = uint(parseID)

	if err := cc.CategoriesService.UpdateCategories(c.Context(), &categories); err != nil {
		return err
	}
	return c.JSON(domain.SuccessResponse(nil))
}
