package bootstrap

import (
	"github.com/redis/go-redis/v9"
	mail "github.com/xhit/go-simple-mail/v2"
	"gorm.io/gorm"
)

type Application struct {
	Env   *Env
	DB    *gorm.DB
	Redis *redis.Client
	Mail  *mail.SMTPClient
}

func App() Application {
	var app Application

	app.Env = NewEnv()
	app.DB = NewDataBase(app.Env)
	app.Redis = NewRedis(app.Env)
	app.Mail = NewMail(app.Env)

	return app
}
