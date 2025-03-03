package bootstrap

import (
	"log"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func NewDataBase(env *Env) *gorm.DB {
	dbConfig := env.Database
	//连接数据库
	db, err := gorm.Open(mysql.Open(dbConfig.DSN), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		log.Fatal("Failed to connect to database!", err)
	}

	//读取数据库链接
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("Failed to get sqlDB", err)
	}

	//设置连接池
	sqlDB.SetMaxIdleConns(dbConfig.MaxIdleConns)
	sqlDB.SetMaxOpenConns(dbConfig.MaxOpenConns)
	sqlDB.SetConnMaxLifetime(time.Hour)

	return db
}
