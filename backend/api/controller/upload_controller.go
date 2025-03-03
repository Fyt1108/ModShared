package controller

import (
	"ModVerse/domain"
	"errors"

	"github.com/gofiber/fiber/v3"
)

type UploadController struct {
	UploadService domain.UploadService
}

func (uc *UploadController) UploadPostImage(c fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return err
	}

	id, ok := c.Locals("id").(string)
	if !ok {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(domain.ErrorResponse(errors.New("assertion failed")))
	}

	fileURL, err := uc.UploadService.UploadPostImage(c.Context(), file, id)
	if err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(fileURL))
}

func (uc *UploadController) UploadFile(c fiber.Ctx) error {
	id, ok := c.Locals("id").(string)
	if !ok {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(domain.ErrorResponse(errors.New("assertion failed")))
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return err
	}

	uploadType := c.Query("type")
	if uploadType == "" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(domain.ErrorResponse(errors.New("type is required")))
	}

	fileID, err := uc.UploadService.UploadFile(c.Context(), file, id, uploadType)
	if err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(fiber.Map{
		"file_id": fileID,
	}),
	)
}

func (uc *UploadController) GetFile(c fiber.Ctx) error {
	sf, err := uc.UploadService.GetFile(c.Context(), c.Params("id"))
	if err != nil {
		return err
	}
	return c.JSON(domain.SuccessResponse(sf))
}

func (uc *UploadController) GetFiles(c fiber.Ctx) error {
	sf, err := uc.UploadService.GetFiles(c.Context())
	if err != nil {
		return err
	}
	return c.JSON(domain.SuccessResponse(sf))
}

func (uc *UploadController) DeleteFile(c fiber.Ctx) error {
	if err := uc.UploadService.RemoveFile(c.Context(), c.Params("id")); err != nil {
		return err
	}
	return c.JSON(domain.SuccessResponse(nil))

}
