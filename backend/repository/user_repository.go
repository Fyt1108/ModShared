package repository

import (
	"ModVerse/domain"
	"ModVerse/internal/utils"
	"context"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type userRepository struct {
	DB *gorm.DB
}

func NewUserRepository(db *gorm.DB) domain.UserRepository {
	return &userRepository{
		DB: db,
	}
}

// 创建用户
func (r *userRepository) CreateUser(c context.Context, user *domain.User) error {
	tx := r.DB.WithContext(c).Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err := tx.Create(user).Error; err != nil {
		tx.Rollback()
		return err
	}

	user.UserProfile.UserID = user.ID
	user.UserProfile.Description = "A Mod Creator"

	if err := tx.Create(&user.UserProfile).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return err
	}

	return nil
}

// 修改密码
func (r *userRepository) UpdatePassword(c context.Context, id string, password string) error {
	if err := r.DB.WithContext(c).Model(&domain.User{}).Where("id = ?", id).Update("password", password).Error; err != nil {
		return err
	}
	return nil
}

// 修改登录时间
func (r *userRepository) UpdateLoginTime(c context.Context, id string, loginTime time.Time) error {
	if err := r.DB.WithContext(c).Model(&domain.User{}).Where("id = ?", id).Update("last_login", loginTime).Error; err != nil {
		return err
	}
	return nil
}

// 根据id读取用户
func (r *userRepository) ReadUser(c context.Context, id string) (*domain.UserResponse, error) {
	var user domain.UserResponse

	if err := r.DB.WithContext(c).
		Model(&domain.User{}).
		Joins("UserProfile.AvatarFile").
		First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// 根据名字或邮箱读取用户
func (r *userRepository) ReadUserByNameOrEmail(c context.Context, name string) (*domain.User, error) {
	var user domain.User

	if err := r.DB.WithContext(c).
		Model(&domain.User{}).
		Where("user_name = ? OR email = ?", name, name).
		First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// 查询用户
func (r *userRepository) ReadUsers(c context.Context, params *domain.UserQuery) (*[]domain.UsersResponse, int64, error) {
	var apiUsers []domain.UsersResponse
	var total int64

	// 允许的排序字段白名单
	userAllowedFields := map[string]struct{}{
		"user_name":  {},
		"last_login": {},
		"created_at": {},
	}

	//查询的表
	query := r.DB.WithContext(c).Model(&domain.User{})

	//动态添加查询条件
	if params.UserName != "" {
		query = query.Where("user_name LIKE ?", "%"+utils.EscapeLike(params.UserName)+"%")
	}

	if params.Email != "" {
		query = query.Where("email LIKE ?", "%"+utils.EscapeLike(params.Email)+"%")
	}

	if params.Role != "" && params.Role != "all" {
		query = query.Where("role = ?", params.Role)
	}

	if params.Status != "" {
		query = query.Where("status = ?", params.Status)
	}

	// 查询总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if total == 0 {
		return &[]domain.UsersResponse{}, 0, nil
	}

	// 处理排序
	sortField := utils.SafeSortField(params.Sort, userAllowedFields, "user_name")
	orderDirection := utils.SafeOrderDirection(params.Order)

	query = query.Order(clause.OrderByColumn{
		Column: clause.Column{Name: sortField},
		Desc:   orderDirection == "desc",
	})

	query = utils.ApplyPaging(query, params.Page, params.PageSize)

	// 执行查询
	if err := query.Find(&apiUsers).Error; err != nil {
		return nil, 0, err
	}

	return &apiUsers, total, nil
}

// 删除用户
func (r *userRepository) DeleteUser(c context.Context, id string) error {
	var user domain.User

	if err := r.DB.WithContext(c).Select(clause.Associations).Delete(&user, id).Error; err != nil {
		return err
	}
	return nil
}

func (r *userRepository) ReadUserWithMod(c context.Context, id string) (*domain.UserResponse, error) {
	var user domain.UserResponse

	if err := r.DB.WithContext(c).
		Model(&domain.User{}).
		Joins("UserProfile.AvatarFile").
		Preload("Mod", func(db *gorm.DB) *gorm.DB {
			return db.Model(&domain.Mod{}).Select(
				"mods.id,mods.name,mods.description,mods.game_id,mods.cover_id,mods.total_downloads,mods.likes,mods.user_id,mods.category,mods.last_update").
				Joins("CoverFile").Joins("Game")
		}).
		First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) ReadUserByNameWithMod(c context.Context, name string) (*domain.UserResponse, error) {
	var user domain.UserResponse

	if err := r.DB.WithContext(c).
		Model(&domain.User{}).
		Joins("UserProfile.AvatarFile").
		Preload("Mod", func(db *gorm.DB) *gorm.DB {
			return db.Model(&domain.Mod{}).Select(
				"mods.id,mods.name,mods.description,mods.game_id,mods.cover_id,mods.total_downloads,mods.likes,mods.user_id,mods.category,mods.last_update").
				Joins("CoverFile").Joins("Game")
		}).
		Where("user_name = ?", name).
		First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) UpdateUserState(c context.Context, user *domain.User) error {
	return r.DB.WithContext(c).Model(user).Updates(*user).Error
}

func (r *userRepository) ReadUserAllInfo(c context.Context, id string) (*domain.User, error) {
	var user domain.User
	if err := r.DB.WithContext(c).First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}
