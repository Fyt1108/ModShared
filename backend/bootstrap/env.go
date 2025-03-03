package bootstrap

import (
	"log"

	"github.com/spf13/viper"
)

// 配置文件结构体
type Env struct {
	//后端名字与端口
	App struct {
		Name                   string
		Host                   string
		Port                   string
		ContextTimeout         int
		AccessTokenExpiryHour  int
		RefreshTokenExpiryHour int
		TokenSecret            string
	}
	//数据库配置
	Database struct {
		DSN          string //数据库连接字符串
		MaxIdleConns int    //最大空闲连接数
		MaxOpenConns int    //最大打开连接数
	}
	//Redis配置
	Redis struct {
		Addr     string //redis地址
		DB       int    //redis数据库
		Password string //redis密码
	}
	//验证码服务器配置
	Mail struct {
		Host           string
		Port           int
		User           string
		Password       string
		ConnectTimeout int
		SendTimeout    int
	}
}

func NewEnv() *Env {
	viper.SetConfigName("env")  //配置名称(不需要带后缀)
	viper.SetConfigType("yaml") //配置格式
	viper.AddConfigPath("../")  //配置文件路径(相对于执行程序)

	env := new(Env)

	//读取配置文件
	if err := viper.ReadInConfig(); err != nil {
		log.Fatal("Reading Config Error:", err) //读取配置文件失败,退出程序
	}

	//解析配置文件
	if err := viper.Unmarshal(env); err != nil {
		log.Fatal("Unmarshal Config Error:", err)
	}

	return env
}
