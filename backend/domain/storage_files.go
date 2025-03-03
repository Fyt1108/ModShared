package domain

import (
	"context"
	"mime/multipart"

	"gorm.io/gorm"
)

type StorageFile struct {
	gorm.Model
	UserID   uint64 `gorm:"index;comment:用户ID" json:"user_id"`
	FileKey  string `gorm:"size:255;uniqueIndex;comment:文件路径" json:"file_key"`
	FileName string `gorm:"size:128;comment:原始文件名" json:"file_name"`
	FileSize int64  `gorm:"comment:字节数" json:"file_size"`
	MIMEType string `gorm:"size:64;comment:MIME类型" json:"mime_type"`
	URL      string `gorm:"size:512;comment:访问地址" json:"url"`
	IsTemp   bool   `gorm:"default:false;comment:临时标记" json:"is_temp"`
}

type StorageFileResponse struct {
	ID  uint   `json:"id"`
	URL string `json:"url"`
}

type DownloadFileResponse struct {
	ID       uint   `json:"id"`
	FileKey  string `json:"-"`
	FileName string `json:"file_name"`
	FileSize int64  `json:"file_size"`
	URL      string `json:"url"`
}

type StorageFileRepository interface {
	CreateStorageFile(c context.Context, sf *StorageFile) error
	GetStorageFile(c context.Context, id string) (*StorageFile, error)
	GetStorageFiles(c context.Context) (*[]StorageFile, error)
	DeleteStorageFile(c context.Context, id string) error
}

type UploadService interface {
	UploadPostImage(c context.Context, file *multipart.FileHeader, id string) (string, error)
	UploadFile(c context.Context, file *multipart.FileHeader, id string, uploadType string) (uint, error)
	GetFile(c context.Context, id string) (*StorageFile, error)
	GetFiles(c context.Context) (*[]StorageFile, error)
	RemoveFile(c context.Context, id string) error
}
