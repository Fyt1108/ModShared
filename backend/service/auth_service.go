package service

import (
	"ModVerse/bootstrap"
	"ModVerse/domain"
	"ModVerse/internal/custom"
	"ModVerse/internal/utils"
	"context"
	"fmt"
	"time"

	mail "github.com/xhit/go-simple-mail/v2"
)

type authService struct {
	userRepo  domain.UserRepository
	redisRepo domain.RedisRepository
	timeout   time.Duration
	env       *bootstrap.Env
	mail      *mail.SMTPClient
}

func NewAuthService(r domain.UserRepository, rd domain.RedisRepository,
	t time.Duration, env *bootstrap.Env, m *mail.SMTPClient) domain.AuthService {
	return &authService{
		userRepo:  r,
		redisRepo: rd,
		timeout:   t,
		env:       env,
		mail:      m,
	}
}

func (s *authService) Register(c context.Context, r *domain.RegisterRequest) error {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()
	//从redis中读取的验证码
	code, err := s.redisRepo.GetValue(ctx, r.Email)
	if err != nil {
		return custom.CodeInvalidError
	}

	if code != r.Code {
		return custom.CodeInvalidError
	}

	user := &domain.User{
		UserName: r.UserName,
		Email:    r.Email,
		Password: r.Password,
	}

	if _, err := s.userRepo.ReadUserByNameOrEmail(c, user.UserName); err == nil {
		return custom.UserExistError
	}

	id, err := utils.GenerateID()
	if err != nil {
		return err
	}
	user.ID = id

	//获得加密密码
	hashPwd, err := utils.HashPassword(user.Password)
	if err != nil {
		return err
	}
	user.Password = hashPwd

	if err := s.userRepo.CreateUser(c, user); err != nil {
		return err
	}

	if err := s.redisRepo.DeleteValue(c, user.Email); err != nil {
		return err
	}

	return nil
}

func (s *authService) Login(c context.Context, username string, password string) (map[string]string, error) {
	var user *domain.User

	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	//验证用户名
	if u, err := s.userRepo.ReadUserByNameOrEmail(ctx, username); err == nil {
		user = u
	} else {
		return nil, custom.UserPassError
	}

	if user.Status == "disabled" {
		return nil, custom.UserDisabledError
	}

	//验证密码
	if !utils.CheckPassword(password, user.Password) {
		return nil, custom.UserPassError
	}

	//生成token
	newToken := make(map[string]string, 2)
	authorization, err := utils.GenerateJWT(fmt.Sprint(user.ID), user.Role,
		time.Now().Add(time.Hour*time.Duration(s.env.App.AccessTokenExpiryHour)).Unix(),
		s.env.App.TokenSecret)
	if err != nil {
		return nil, err
	}
	newToken["authorization"] = authorization

	refreshtoken, err := utils.GenerateJWT(fmt.Sprint(user.ID), user.Role,
		time.Now().Add(time.Hour*time.Duration(s.env.App.RefreshTokenExpiryHour)).Unix(),
		s.env.App.TokenSecret)
	if err != nil {
		return nil, err
	}
	newToken["refreshtoken"] = refreshtoken

	if err := s.userRepo.UpdateLoginTime(ctx, fmt.Sprint(user.ID), time.Now()); err != nil {
		return nil, err
	}

	return newToken, nil
}

func (s *authService) RefreshToken(token string) (map[string]string, error) {
	if token == "" {
		return nil, custom.TokenInvalidError
	}

	//解析token,获取用户名ID
	id, role, err := utils.ParseJWT(token, s.env.App.TokenSecret)
	if err != nil {
		return nil, custom.TokenInvalidError
	}

	newToken := make(map[string]string, 2)

	authorization, err := utils.GenerateJWT(id, role,
		time.Now().Add(time.Hour*time.Duration(s.env.App.AccessTokenExpiryHour)).Unix(),
		s.env.App.TokenSecret)
	if err != nil {
		return nil, err
	}
	newToken["authorization"] = authorization

	refreshtoken, err := utils.GenerateJWT(id, role,
		time.Now().Add(time.Hour*time.Duration(s.env.App.RefreshTokenExpiryHour)).Unix(),
		s.env.App.TokenSecret)
	if err != nil {
		return nil, err
	}
	newToken["refreshtoken"] = refreshtoken

	return newToken, nil

}

func (s *authService) ResetPassword(c context.Context, token string, password string) error {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	//验证token是否使用过
	if _, err := s.redisRepo.GetValue(ctx, token); err != nil {
		return custom.TokenInvalidError
	}

	//解析token是否有效
	id, _, err := utils.ParseJWT(token, s.env.App.TokenSecret)
	if err != nil {
		return custom.TokenInvalidError
	}
	//获得加密密码
	hashPwd, err := utils.HashPassword(password)
	if err != nil {
		return err
	}
	password = hashPwd

	if err := s.userRepo.UpdatePassword(ctx, id, password); err != nil {
		return err
	}

	if err := s.redisRepo.DeleteValue(ctx, token); err != nil {
		return err
	}
	return nil

}

func (s *authService) SendResetEmail(c context.Context, email string) error {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	//检查用户是否存在
	u, err := s.userRepo.ReadUserByNameOrEmail(ctx, email)
	if err != nil {
		return custom.DataNotExistError
	}
	//生成token
	token, err := utils.GenerateJWT(fmt.Sprint(u.ID), u.Role,
		time.Now().Add(time.Minute*15).Unix(),
		s.env.App.TokenSecret)
	if err != nil {
		return err
	}
	//去掉token前缀
	token = token[7:]
	//发送邮件
	if err := utils.SendResetEmail(email, s.env.Mail.User, token, s.mail); err != nil {
		return err
	}
	//将token存入redis
	if err := s.redisRepo.SetValue(ctx, token, "true", 15*time.Minute); err != nil {
		return err
	}

	return nil

}

func (s *authService) SendVerificationEmail(c context.Context, email string) error {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	if _, err := s.userRepo.ReadUserByNameOrEmail(ctx, email); err == nil {
		return custom.DataNotExistError
	}

	code, err := utils.SendVerificationCode(email, s.env.Mail.User, s.mail)
	if err != nil {
		return err
	}

	if err := s.redisRepo.SetValue(ctx, email, code, 5*time.Minute); err != nil {
		return err
	}

	return nil
}

func (s *authService) UpdateLoginTime(c context.Context, id string) error {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	if err := s.userRepo.UpdateLoginTime(ctx, id, time.Now()); err != nil {
		return err
	}
	return nil
}

func (s *authService) ChangePassword(c context.Context, id string, request *domain.ChangePasswordRequest) error {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()
	user, err := s.userRepo.ReadUserAllInfo(ctx, id)

	if err != nil {
		return err
	}

	if !utils.CheckPassword(request.OldPassword, user.Password) {
		return custom.OriginPasswordError
	}

	hashPwd, err := utils.HashPassword(request.NewPassword)
	if err != nil {
		return err
	}

	if err := s.userRepo.UpdatePassword(ctx, id, hashPwd); err != nil {
		return err
	}
	return nil
}
