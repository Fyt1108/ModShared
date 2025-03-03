package service

import (
	"ModVerse/bootstrap"
	"ModVerse/domain"
	"ModVerse/internal/utils"
	"context"
	"errors"
	"mime/multipart"
	"strconv"
	"strings"
	"time"
)

type uploadService struct {
	storageFileRepo domain.StorageFileRepository
	env             *bootstrap.Env
	timeout         time.Duration
}

func NewUploadService(r domain.StorageFileRepository, env *bootstrap.Env, t time.Duration) domain.UploadService {
	return &uploadService{
		storageFileRepo: r,
		env:             env,
		timeout:         t,
	}
}

const api = "/api/data/"
const download = "/api/download/"
const modPath = "../../storage/mods/"
const userPath = "../../storage/users/"
const gamePath = "../../storage/games/"
const postPath = "../../storage/posts/"

func formatPath(path string) string {
	index := strings.Index(path, "storage")
	result := path[index+len("storage")+1:]

	return result
}

func (s *uploadService) UploadPostImage(c context.Context, file *multipart.FileHeader, id string) (string, error) {
	path, err := utils.UploadFile(file, postPath+id)
	if err != nil {
		return "", err
	}

	//id转为uint64类型
	parseID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		return "", err
	}

	sf := &domain.StorageFile{
		UserID:   parseID,
		FileKey:  path,
		FileName: file.Filename,
		FileSize: file.Size,
		MIMEType: "image/*",
		URL:      s.env.App.Host + ":" + s.env.App.Port + api + formatPath(path),
	}

	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	if err := s.storageFileRepo.CreateStorageFile(ctx, sf); err != nil {
		utils.DeleteFile(path)
		return "", err
	}

	return sf.URL, nil
}

func (s *uploadService) UploadFile(c context.Context, file *multipart.FileHeader, id string, uploadType string) (uint, error) {
	var p string
	var mimeType string
	var newPath string

	switch uploadType {
	case "mod_file":
		mimeType = "application/zip"
		p = modPath + id
	case "mod_cover":
		mimeType = "image/*"
		p = modPath + id
	case "game_logo":
		mimeType = "image/*"
		p = gamePath + id
	case "user_avatar":
		mimeType = "image/*"
		p = userPath + id
	default:
		return 0, errors.New("invalid upload type")
	}

	if uploadType == "mod_file" {
		path, err := utils.UploadDownloadFile(file, p)
		if err != nil {
			return 0, err
		}
		newPath = path
	} else {
		path, err := utils.UploadFile(file, p)
		if err != nil {
			return 0, err
		}
		newPath = path
	}

	parseID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		return 0, err
	}

	sf := &domain.StorageFile{
		UserID:   parseID,
		FileKey:  newPath,
		FileName: file.Filename,
		FileSize: file.Size,
		MIMEType: mimeType,
		URL:      s.env.App.Host + ":" + s.env.App.Port + api + formatPath(newPath),
	}

	if uploadType == "mod_file" {
		sf.URL = s.env.App.Host + ":" + s.env.App.Port + download + formatPath(newPath)
	}

	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	if err := s.storageFileRepo.CreateStorageFile(ctx, sf); err != nil {
		utils.DeleteFile(newPath)
		return 0, err
	}

	return sf.ID, nil
}

func (s *uploadService) GetFile(c context.Context, id string) (*domain.StorageFile, error) {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	return s.storageFileRepo.GetStorageFile(ctx, id)
}

func (s *uploadService) GetFiles(c context.Context) (*[]domain.StorageFile, error) {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	return s.storageFileRepo.GetStorageFiles(ctx)
}

func (s *uploadService) RemoveFile(c context.Context, id string) error {
	ctx, cancel := context.WithTimeout(c, s.timeout)
	defer cancel()

	sf, err := s.storageFileRepo.GetStorageFile(ctx, id)
	if err != nil {
		return err
	}

	if err := s.storageFileRepo.DeleteStorageFile(ctx, id); err != nil {
		return err
	}

	if err := utils.DeleteFile(sf.FileKey); err != nil {
		return err
	}

	return nil
}
