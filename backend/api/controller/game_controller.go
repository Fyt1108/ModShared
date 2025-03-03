package controller

import (
	"ModVerse/domain"

	"github.com/gofiber/fiber/v3"
)

type GameController struct {
	GameService domain.GameService
}

func (gc *GameController) CreateGame(c fiber.Ctx) error {
	var requestBody domain.CreateGameRequest
	if err := c.Bind().Body(&requestBody); err != nil {
		c.Status(fiber.StatusBadRequest)
		return err
	}

	game := domain.Game{
		Name:        requestBody.Name,
		LogoID:      requestBody.LogoID,
		Publishers:  requestBody.Publishers,
		Developers:  requestBody.Developers,
		ReleaseTime: requestBody.ReleaseTime,
	}

	if err := gc.GameService.CreateGame(c.Context(), &game); err != nil {
		return err
	}
	return c.JSON(domain.SuccessResponse(nil))
}

func (gc *GameController) GetGame(c fiber.Ctx) error {
	game, err := gc.GameService.GetGame(c.Context(), c.Params("id"))
	if err != nil {
		return err
	}
	return c.JSON(domain.SuccessResponse(game))
}

func (gc *GameController) GetGames(c fiber.Ctx) error {
	var queryBody domain.GameQuery
	if err := c.Bind().Query(&queryBody); err != nil {
		c.Status(fiber.StatusBadRequest)
		return err
	}

	games, total, err := gc.GameService.GetGames(c.Context(), &queryBody)
	if err != nil {
		return err
	}
	return c.JSON(domain.SuccessResponse(fiber.Map{
		"list":  games,
		"total": total,
	},
	))
}

func (gc *GameController) UpdateGame(c fiber.Ctx) error {
	var requestBody domain.UpdateGameRequest
	if err := c.Bind().Body(&requestBody); err != nil {
		c.Status(fiber.StatusBadRequest)
		return err
	}

	if err := gc.GameService.UpdateGame(c.Context(), c.Params("id"), &requestBody); err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(nil))
}

func (gc *GameController) DeleteGame(c fiber.Ctx) error {
	if err := gc.GameService.DeleteGame(c.Context(), c.Params("id")); err != nil {
		return err
	}
	return c.JSON(domain.SuccessResponse(nil))
}
