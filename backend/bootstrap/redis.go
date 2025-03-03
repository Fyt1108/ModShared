package bootstrap

import (
	"context"
	"log"

	"github.com/redis/go-redis/v9"
)

// NewRedis 函数用于创建一个新的 Redis 客户端实例
func NewRedis(env *Env) *redis.Client {
	// 从环境配置中获取 Redis 配置信息
	redisConfig := env.Redis

	// 使用 redisConfig 中的配置信息创建一个新的 Redis 客户端
	RedisClient := redis.NewClient(&redis.Options{
		Addr:     redisConfig.Addr,     // Redis 服务器地址
		DB:       redisConfig.DB,       // 使用的 Redis 数据库编号
		Password: redisConfig.Password, // 连接 Redis 服务器所需的密码
	})

	//检测redis是否连接成功
	if _, err := RedisClient.Ping(context.Background()).Result(); err != nil {
		log.Fatal("Failed to connect to Redis:", err)
	}

	return RedisClient
}
