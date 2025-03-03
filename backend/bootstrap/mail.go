package bootstrap

import (
	"log"
	"time"

	mail "github.com/xhit/go-simple-mail/v2"
)

func NewMail(env *Env) *mail.SMTPClient {
	emailConfig := env.Mail
	client := mail.NewSMTPClient()

	client.Host = emailConfig.Host                                                  // SMTP服务器
	client.Port = emailConfig.Port                                                  // SMTP服务器端口
	client.Username = emailConfig.User                                              // SMTP用户名
	client.Password = emailConfig.Password                                          // SMTP密码
	client.Encryption = mail.EncryptionSSLTLS                                       // SMTP加密方式
	client.ConnectTimeout = time.Duration(emailConfig.ConnectTimeout) * time.Second // 连接超时时间
	client.SendTimeout = time.Duration(emailConfig.SendTimeout) * time.Second       // 发送超时时间

	smtpClient, err := client.Connect()
	if err != nil {
		log.Fatal(err)
	}

	return smtpClient
}
