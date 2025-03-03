package service

import (
	"ModVerse/bootstrap"
	"ModVerse/domain"
	"ModVerse/internal/utils"
	"context"
	"fmt"
	"strconv"
	"time"
)

type userService struct {
	userRepo    domain.UserRepository
	redisRepo   domain.RedisRepository
	profileRepo domain.UserProfileRepository
	sfRepo      domain.StorageFileRepository
	timeout     time.Duration
	env         *bootstrap.Env
}

func NewUserService(r domain.UserRepository, rd domain.RedisRepository,
	p domain.UserProfileRepository, t time.Duration, env *bootstrap.Env,
	sf domain.StorageFileRepository) domain.UserService {
	return &userService{
		userRepo:    r,
		redisRepo:   rd,
		timeout:     t,
		env:         env,
		profileRepo: p,
		sfRepo:      sf,
	}
}

func (s *userService) GetUserByID(c context.Context, id string) (*domain.UserResponse, error) {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	user, err := s.userRepo.ReadUser(ctx, id)
	if err != nil {
		return nil, err
	}

	if user.UserProfile.AvatarID == 0 {
		user.UserProfile.AvatarFile.URL = s.env.App.Host + ":" + s.env.App.Port +
			"/api/data/users/default-avatar.png"
	}
	return user, nil
}

func (s *userService) UpdateProfile(c context.Context, requestBody *domain.UpdateUserProfileRequest, id string) error {
	parseID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	profile := domain.UserProfile{
		UserID:      parseID,
		AvatarID:    requestBody.NewAvatarID,
		Description: requestBody.Description,
	}

	if err := s.profileRepo.UpdateProfile(ctx, &profile); err != nil {
		return err
	}

	if requestBody.OldAvatarID != 0 && requestBody.NewAvatarID != requestBody.OldAvatarID {
		oldAvatarFile, err := s.sfRepo.GetStorageFile(ctx, fmt.Sprint(requestBody.OldAvatarID))
		if err != nil {
			return err
		}

		if err := s.sfRepo.DeleteStorageFile(ctx, fmt.Sprint(requestBody.OldAvatarID)); err != nil {
			return err
		}

		if err := utils.DeleteFile(oldAvatarFile.FileKey); err != nil {
			return err
		}
	}

	return nil
}

func (s *userService) GetUserWithMod(c context.Context, id string) (*domain.UserResponse, error) {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	user, err := s.userRepo.ReadUserWithMod(ctx, id)
	if err != nil {
		return nil, err
	}

	if user.UserProfile.AvatarID == 0 {
		user.UserProfile.AvatarFile.URL = s.env.App.Host + ":" + s.env.App.Port +
			"/api/data/users/default-avatar.png"
	}
	return user, nil
}

func (s *userService) GetUserByNameWithMod(c context.Context, name string) (*domain.UserResponse, error) {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	user, err := s.userRepo.ReadUserByNameWithMod(ctx, name)
	if err != nil {
		return nil, err
	}

	if user.UserProfile.AvatarID == 0 {
		user.UserProfile.AvatarFile.URL = s.env.App.Host + ":" + s.env.App.Port +
			"/api/data/users/default-avatar.png"
	}
	return user, nil
}

func (s *userService) GetUsers(c context.Context, params *domain.UserQuery) (*[]domain.UsersResponse, int64, error) {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	user, total, err := s.userRepo.ReadUsers(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	return user, total, nil
}

func (s *userService) DeleteUser(c context.Context, id string) error {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	return s.userRepo.DeleteUser(ctx, id)
}

func (s *userService) UpdateUserState(c context.Context, user *domain.User) error {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	return s.userRepo.UpdateUserState(ctx, user)
}
