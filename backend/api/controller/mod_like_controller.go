package controller

import (
	"ModVerse/domain"
	"errors"
	"strconv"

	"github.com/gofiber/fiber/v3"
)

type ModLikeController struct {
	ModLikeService domain.ModLikeService
}

// @Summary 点赞模组
// @Router /api/mods/{id}/likes [post]
func (mc *ModLikeController) LikeMod(c fiber.Ctx) error {
	id, ok := c.Locals("id").(string)
	if !ok {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(domain.ErrorResponse(errors.New("assertion failed")))
	}

	parseID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		return err
	}

	parseID2, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return err
	}

	modLike := domain.ModLike{
		UserID: parseID,
		ModID:  uint(parseID2),
	}

	if err := mc.ModLikeService.LikeMod(c.Context(), &modLike); err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(nil))
}

// @Summary 取消点赞
// @Router /api/mods/{id}/likes [delete]
func (mc *ModLikeController) UnlikeMod(c fiber.Ctx) error {
	id, ok := c.Locals("id").(string)
	if !ok {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(domain.ErrorResponse(errors.New("assertion failed")))
	}

	if err := mc.ModLikeService.UnlikeMod(c.Context(), id, c.Params("id")); err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(nil))
}

// @Summary 获取点赞状态
// @Router /api/mods/{id}/likes/status [get]
func (mc *ModLikeController) GetLikeStatus(c fiber.Ctx) error {
	id, ok := c.Locals("id").(string)
	if !ok {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(domain.ErrorResponse(errors.New("assertion failed")))
	}

	status, err := mc.ModLikeService.GetLikeStatus(c.Context(), id, c.Params("id"))
	if err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(status))
}
