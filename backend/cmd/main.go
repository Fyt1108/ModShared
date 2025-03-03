package main

import (
	"ModVerse/api/routes"
	"ModVerse/bootstrap"
	"ModVerse/domain"
	"ModVerse/internal/utils"
	"context"
	"fmt"
	"os"
	"os/signal"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/compress"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/etag"
	"github.com/gofiber/fiber/v3/middleware/idempotency"
	"github.com/gofiber/fiber/v3/middleware/static"
	"gorm.io/gorm"
)

func main() {
	config := bootstrap.App()

	SyncConfig := &bootstrap.SyncConfig{
		RedisKeyPattern: "counters:*", // 类型占位符 + ID占位符
		FieldMappings: map[string]string{
			"likes":           "likes",
			"downloads":       "downloads",
			"total_downloads": "total_downloads",
		},
		SyncInterval: 5 * time.Minute,
		BatchSize:    200,
		EnableLock:   false,
		LockKey:      "counter_sync_lock",
		LockTTL:      5 * time.Minute,
	}

	env := config.Env
	db := config.DB
	redis := config.Redis
	mail := config.Mail
	timeout := time.Duration(env.App.ContextTimeout) * time.Second

	//服务器配置
	app := newServer()
	//初始化数据库表
	initTable(db)
	//初始化同步服务
	sync := bootstrap.NewCounterSync(db, redis, SyncConfig)
	sync.Start(context.Background())
	defer sync.Stop()
	//初始化路由
	routes.Setup(app, db, redis, mail, env, timeout)

	//启动协程，监听端口
	go func() {
		if err := app.Listen(":"+env.App.Port, fiber.ListenConfig{EnablePrefork: true}); err != nil {
			fmt.Println(err)
		}
	}()

	//创建一个通道用于接收操作系统信号
	quit := make(chan os.Signal, 1)
	//监听中断信号（如Ctrl+C）
	signal.Notify(quit, os.Interrupt)
	//阻塞等待信号
	<-quit
	fmt.Println("Server shutting down...")
	//关闭服务器
	app.Shutdown()
}

func newServer() *fiber.App {
	//服务器配置
	app := fiber.New(fiber.Config{
		StructValidator: &utils.StructValidator{Validator: validator.New()}, //使用的验证器
		BodyLimit:       102 * 1024 * 1024,                                  //限制请求体大小
		//自定义错误处理
		ErrorHandler: func(c fiber.Ctx, err error) error {
			//判断c.Status是否为200,是200改为默认错误500
			if c.Response().StatusCode() == 200 {
				c.Status(fiber.StatusInternalServerError)
			}

			return c.JSON(domain.ErrorResponse(err))
		},
	})

	//使用服务器跨域配置
	app.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:5175"},
		AllowMethods:     []string{fiber.MethodGet, fiber.MethodPost, fiber.MethodPut, fiber.MethodDelete},
		AllowHeaders:     []string{"Content-Type", "Authorization", "isRefreshToken", "cache-control", "x-requested-with"},
		ExposeHeaders:    []string{"Content-Length", "Authorization", "RefreshToken"},
		AllowCredentials: true,
		MaxAge:           10800,
	}))
	app.Use(idempotency.New()) //使用idempotency中间件,防止网路问题多次请求
	app.Use(etag.New())        //使用etag中间件,内容无变化不发送数据,节省带宽
	app.Use(compress.New())    //压缩中间件,压缩传输数据,节省带宽

	//静态文件
	app.Use("/api/data", static.New("../../storage", static.Config{
		CacheDuration: 2 * time.Second,
	}))

	//下载文件
	app.Use("/api/download", static.New("../../storage", static.Config{
		Download: true,
	}))

	return app
}

func initTable(db *gorm.DB) {
	if err := db.AutoMigrate(&domain.Game{}); err != nil {
		panic(err)
	}

	if err := db.AutoMigrate(&domain.User{}); err != nil {
		panic(err)
	}

	if err := db.AutoMigrate(&domain.UserProfile{}); err != nil {
		panic(err)
	}

	if err := db.AutoMigrate(&domain.StorageFile{}); err != nil {
		panic(err)
	}

	if err := db.AutoMigrate(&domain.Mod{}); err != nil {
		panic(err)
	}

	if err := db.AutoMigrate(&domain.ModVersion{}); err != nil {
		panic(err)
	}

	if err := db.AutoMigrate(&domain.Comment{}); err != nil {
		panic(err)
	}

	if err := db.AutoMigrate(&domain.ModFavorite{}); err != nil {
		panic(err)
	}

	if err := db.AutoMigrate(&domain.ModLike{}); err != nil {
		panic(err)
	}

	if err := db.AutoMigrate(&domain.Categories{}); err != nil {
		panic(err)
	}

	if err := db.AutoMigrate(&domain.Report{}); err != nil {
		panic(err)
	}
}
