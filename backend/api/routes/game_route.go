package routes

import (
	"ModVerse/api/controller"
	"ModVerse/repository"
	"ModVerse/service"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

func NewGameRoute(r fiber.Router, db *gorm.DB, redis *redis.Client, timeout time.Duration) {
	gr := repository.NewGameRepository(db)
	rr := repository.NewRedisRepository(redis)
	sf := repository.NewStorageFileRepository(db)

	gs := service.NewGameService(gr, rr, sf, timeout)

	gc := controller.GameController{
		GameService: gs,
	}

	game := r.Group("/game")

	game.Post("/", gc.CreateGame)
	game.Get("/:id", gc.GetGame)
	game.Get("/", gc.GetGames)
	game.Delete("/:id", gc.DeleteGame)
	game.Put("/:id", gc.UpdateGame)
}
