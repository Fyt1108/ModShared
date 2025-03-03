package utils

import (
	"fmt"
	"strconv"
	"time"

	"math/rand"

	mail "github.com/xhit/go-simple-mail/v2"
)

const nickname = "ModVerse"

func SendVerificationCode(to string, from string, smtpClient *mail.SMTPClient) (string, error) {
	// 生成一个随机的6位验证码
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	code := strconv.Itoa(r.Intn(1000000))

	const subject = "ModVerse验证码"
	body := fmt.Sprintf("您的验证码是(有效为5分钟):%s", code)

	email := mail.NewMSG()
	email.SetFrom(nickname+"<"+from+">").
		AddTo(to).
		SetSubject(subject).
		SetBody(mail.TextHTML, body)

	if email.Error != nil {
		return "", email.Error
	}

	if err := email.Send(smtpClient); err != nil {
		return "", err
	}
	return code, nil
}

func SendResetEmail(to string, from string, token string, smtpClient *mail.SMTPClient) error {
	const subject = "ModVerse重置密码"

	body := "<p>请点击以下链接重置您的密码(链接有效期为15分钟):</p>" + "<a href=\"http://localhost:5173/reset-password/reset/" + token + "\"target=\"_blank\">重置密码</a>" + "<p>如果您没有请求重置密码，请忽略此邮件。</p>"

	email := mail.NewMSG()
	email.SetFrom(nickname+"<"+from+">").
		AddTo(to).
		SetSubject(subject).
		SetBody(mail.TextHTML, body)

	if email.Error != nil {
		return email.Error
	}

	if err := email.Send(smtpClient); err != nil {
		return err
	}

	return nil
}
