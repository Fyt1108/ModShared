package controller

import (
	"ModVerse/domain"
	"strconv"

	"github.com/gofiber/fiber/v3"
)

type ReportController struct {
	ReportService domain.ReportService
}

// CreateReport 创建举报
func (h *ReportController) CreateReport(c fiber.Ctx) error {
	var req domain.CreateReportRequest
	if err := c.Bind().Body(&req); err != nil {
		c.Status(fiber.StatusBadRequest)
		return err
	}

	// 获取当前用户ID
	userID := c.Locals("id").(string)
	reporterID, err := strconv.ParseUint(userID, 10, 64)
	if err != nil {
		return err
	}

	report := domain.Report{
		Type:       req.Type,
		Target:     req.Target,
		ReporterID: reporterID,
		Reason:     req.Reason,
	}

	if err := h.ReportService.CreateReport(c.Context(), &report); err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(nil))
}

// UpdateReport 更新举报状态
func (h *ReportController) UpdateReport(c fiber.Ctx) error {
	id := c.Params("id")
	var req domain.UpdateReportRequest
	if err := c.Bind().Body(&req); err != nil {
		c.Status(fiber.StatusBadRequest)
		return err
	}

	if err := h.ReportService.UpdateReport(c.Context(), id, &req); err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(nil))
}

// GetReport 获取举报详情
func (h *ReportController) GetReport(c fiber.Ctx) error {
	id := c.Params("id")

	report, err := h.ReportService.GetReport(c.Context(), id)
	if err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(report))
}

// GetReports 获取举报列表
func (h *ReportController) GetReports(c fiber.Ctx) error {
	var params domain.ReportQuery
	if err := c.Bind().Query(&params); err != nil {
		c.Status(fiber.StatusBadRequest)
		return err
	}

	reports, total, err := h.ReportService.GetReports(c.Context(), &params)
	if err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(fiber.Map{
		"list":  reports,
		"total": total,
	}))
}

func (h *ReportController) DeleteReport(c fiber.Ctx) error {
	id := c.Params("id")

	if err := h.ReportService.DeleteReport(c.Context(), id); err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(nil))
}
