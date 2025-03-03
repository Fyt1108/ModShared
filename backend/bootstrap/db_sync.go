package bootstrap

import (
	"context"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

// SyncConfig 同步配置
type SyncConfig struct {
	RedisKeyPattern string            // Redis键模式（必须包含%s类型占位和%dID占位）
	DBAutoMigrate   bool              // 是否自动创建表结构
	FieldMappings   map[string]string // Redis字段到DB字段的映射（redis_field:db_column）
	SyncInterval    time.Duration     // 同步间隔
	BatchSize       int               // 每批次处理数量
	EnableLock      bool              // 是否启用分布式锁
	LockKey         string            // 分布式锁键名
	LockTTL         time.Duration     // 锁持有时间
}

// CounterSync 通用计数器同步器
type CounterSync struct {
	db     *gorm.DB
	redis  *redis.Client
	config *SyncConfig
	stopCh chan struct{}
}

// NewCounterSync 创建同步器实例
func NewCounterSync(db *gorm.DB, rdb *redis.Client, config *SyncConfig) *CounterSync {
	if config.BatchSize <= 0 {
		config.BatchSize = 100
	}
	if config.SyncInterval <= 0 {
		config.SyncInterval = 5 * time.Minute
	}

	return &CounterSync{
		db:     db,
		redis:  rdb,
		config: config,
		stopCh: make(chan struct{}),
	}
}

// Start 启动同步服务
func (cs *CounterSync) Start(ctx context.Context) {
	go func() {
		ticker := time.NewTicker(cs.config.SyncInterval)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				cs.SyncAll(ctx)
			case <-cs.stopCh:
				return
			case <-ctx.Done():
				return
			}
		}
	}()
}

// Stop 停止同步服务
func (cs *CounterSync) Stop() {
	close(cs.stopCh)
}

// SyncAll 同步所有计数器
func (cs *CounterSync) SyncAll(ctx context.Context) error {
	if cs.config.EnableLock {
		locked, err := cs.acquireLock(ctx)
		if err != nil || !locked {
			return fmt.Errorf("acquire lock failed: %v", err)
		}
		defer cs.releaseLock(ctx)
	}

	// 扫描所有匹配的键
	var cursor uint64
	for {
		keys, nextCursor, err := cs.redis.Scan(ctx, cursor, cs.config.RedisKeyPattern, int64(cs.config.BatchSize)).Result()
		if err != nil {
			return err
		}

		if len(keys) > 0 {
			cs.processBatch(ctx, keys)
		}

		if nextCursor == 0 {
			break
		}
		cursor = nextCursor
	}
	return nil
}

// processBatch 处理批次数据
func (cs *CounterSync) processBatch(ctx context.Context, keys []string) {
	for _, key := range keys {
		// 解析键结构（示例键：counters:video:123）
		parts := strings.Split(key, ":")
		if len(parts) < 3 {
			log.Printf("invalid key format: %s", key)
			continue
		}

		resourceType := parts[1] // 第二个段为资源类型
		resourceID := parts[2]   // 第三个段为资源ID

		// 获取计数器值
		counts, err := cs.redis.HGetAll(ctx, key).Result()
		if err != nil || len(counts) == 0 {
			continue
		}

		// 构建更新映射
		updates := make(map[string]interface{})
		for redisField, dbColumn := range cs.config.FieldMappings {
			if val, exists := counts[redisField]; exists {
				// 获取数据库中的原始值
				var originalValue int
				result := cs.db.Table(getTableName(resourceType)).Where("id = ?", resourceID).Select(dbColumn).Take(&originalValue)
				if result.Error != nil {
					log.Printf("failed to get original value from database: %v", result.Error)
					continue
				}
				// 将Redis中的值转换为整数并相加
				redisValue, err := strconv.Atoi(val)
				if err != nil {
					log.Printf("failed to convert Redis value to int: %v", err)
					continue
				}
				updates[dbColumn] = redisValue + originalValue
			}
		}

		// 执行数据库更新
		if len(updates) > 0 {
			tableName := getTableName(resourceType)
			err := cs.db.Table(tableName).Where("id = ?", resourceID).
				UpdateColumns(updates).Error
			if err != nil {
				log.Printf("update failed: %v", err)
				continue
			}
		}

		//清除已处理数据
		cs.redis.Del(ctx, key)
	}
}

// 获取资源对应的表名
func getTableName(resourceType string) string {
	switch resourceType {
	case "mod":
		return "mods"
	case "mod_version":
		return "mod_versions"
	default:
		return resourceType + "s" // 简单复数形式
	}
}

// 分布式锁操作
func (cs *CounterSync) acquireLock(ctx context.Context) (bool, error) {
	return cs.redis.SetNX(ctx, cs.config.LockKey, 1, cs.config.LockTTL).Result()
}

func (cs *CounterSync) releaseLock(ctx context.Context) error {
	return cs.redis.Del(ctx, cs.config.LockKey).Err()
}
