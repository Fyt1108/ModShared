package repository

import (
	"ModVerse/domain"
	"context"

	"gorm.io/gorm"
)

type storageFileRepository struct {
	DB *gorm.DB
}

func NewStorageFileRepository(db *gorm.DB) domain.StorageFileRepository {
	return &storageFileRepository{
		DB: db,
	}
}

func (r *storageFileRepository) CreateStorageFile(c context.Context, sf *domain.StorageFile) error {
	if err := r.DB.WithContext(c).Create(sf).Error; err != nil {
		return err
	}
	return nil
}

func (r *storageFileRepository) GetStorageFile(c context.Context, id string) (*domain.StorageFile, error) {
	var sf domain.StorageFile
	if err := r.DB.WithContext(c).First(&sf, id).Error; err != nil {
		return nil, err
	}
	return &sf, nil
}

func (r *storageFileRepository) GetStorageFiles(c context.Context) (*[]domain.StorageFile, error) {
	var sfs []domain.StorageFile
	if err := r.DB.WithContext(c).Find(&sfs).Error; err != nil {
		return nil, err
	}
	return &sfs, nil
}

func (r *storageFileRepository) DeleteStorageFile(c context.Context, id string) error {
	var sf domain.StorageFile
	if err := r.DB.WithContext(c).Delete(&sf, id).Error; err != nil {
		return err
	}
	return nil
}
