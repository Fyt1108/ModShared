package utils

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"
)

func UploadFile(file *multipart.FileHeader, path string) (string, error) {
	// 获取文件扩展名
	ext := filepath.Ext(file.Filename)

	// 生成随机文件名
	randomFileName, err := GenerateRandomFileName(ext)
	if err != nil {
		return "", err
	}

	//检测目录是否存在，不存在则创建
	if err := os.MkdirAll(path, os.ModePerm); err != nil {
		return "", err
	}

	// 定义文件路径
	filePath := filepath.Join(path, randomFileName)

	// 打开上传的文件
	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	// 创建目标文件
	dst, err := os.Create(filePath)
	if err != nil {
		return "", err
	}
	defer dst.Close()

	// 复制文件内容到目标位置
	if _, err = io.Copy(dst, src); err != nil {
		return "", err
	}

	filePath = filepath.ToSlash(filePath)

	return filePath, nil
}

func UploadDownloadFile(file *multipart.FileHeader, path string) (string, error) {
	//生成随机字符名8位，用作文件夹名字
	randomFolderName, err := generateRandomString(8)
	if err != nil {
		return "", err
	}
	//拼接文件夹
	folderPath := filepath.Join(path, randomFolderName)
	// 创建文件夹
	if err := os.MkdirAll(folderPath, os.ModePerm); err != nil {
		return "", err
	}
	//保存上传文件
	filePath := filepath.Join(folderPath, file.Filename)
	dst, err := os.Create(filePath)
	if err != nil {
		return "", err
	}
	defer dst.Close()

	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	if _, err := io.Copy(dst, src); err != nil {
		return "", err
	}
	filePath = filepath.ToSlash(filePath)
	// 返回文件路径
	return filePath, nil
}

func GetFile(path string) (string, error) {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return "", err
	}

	return path, nil
}

func DeleteFile(path string) error {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return err
	}

	if err := os.Remove(path); err != nil {
		go retryDeleteFile(path)
		return err
	}

	return nil
}

// 异步重试删除文件
func retryDeleteFile(path string) {
	maxRetries := 3 // 最大重试次数
	for i := 0; i < maxRetries; i++ {
		if err := os.Remove(path); err == nil {
			return
		}
		time.Sleep(time.Second * time.Duration(i+1))
	}
	log.Printf("文件重试删除失败: %s", path)
}

func GenerateRandomFileName(ext string) (string, error) {
	//获取当前时间的时间戳
	timestamp := time.Now().Unix()

	//创建16字节的随机数
	randomBytes := make([]byte, 16)
	if _, err := rand.Read(randomBytes); err != nil {
		return "", err
	}

	//将时间戳和随机数转换为字符串，并添加文件扩展名
	randomPart := hex.EncodeToString(randomBytes)
	return fmt.Sprintf("%d_%s%s", timestamp, randomPart, ext), nil
}

// 生成随机字符串
func generateRandomString(length int) (string, error) {
	bytes := make([]byte, length/2)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
