package controller

import (
	"ModVerse/domain"
	"errors"
	"strconv"

	"github.com/gofiber/fiber/v3"
)

type CommentController struct {
	CommentService domain.CommentService
}

func (cc *CommentController) CreateComment(c fiber.Ctx) error {
	var requestBody domain.CreateCommentRequest

	if err := c.Bind().Body(&requestBody); err != nil {
		c.Status(fiber.StatusBadRequest)
		return err
	}

	id, ok := c.Locals("id").(string)
	if !ok {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(domain.ErrorResponse(errors.New("assertion failed")))
	}

	//id转为uint64类型
	parseID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		return err
	}

	comment := domain.Comment{
		Content:  requestBody.Content,
		UserID:   parseID,
		ParentID: requestBody.ParentID,
		ModID:    requestBody.ModID,
	}

	if err := cc.CommentService.CreateComment(c.Context(), &comment); err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(nil))
}

func (cc *CommentController) GetCommentsWithReplies(c fiber.Ctx) error {
	comment, total, err := cc.CommentService.GetCommentsWithReplies(c.Context(), c.Params("mod_id"))

	if err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(fiber.Map{
		"list":  comment,
		"total": total,
	}))
}

func (cc *CommentController) DeleteComment(c fiber.Ctx) error {
	if err := cc.CommentService.DeleteComment(c.Context(), c.Params("id")); err != nil {
		return err
	}
	return c.JSON(domain.SuccessResponse(nil))
}

func (cc *CommentController) GetAllComments(c fiber.Ctx) error {
	var queryBody domain.CommentQuery

	if err := c.Bind().Query(&queryBody); err != nil {
		c.Status(fiber.StatusBadRequest)
		return err
	}

	comments, total, err := cc.CommentService.GetAllComments(c.Context(), queryBody)

	if err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(fiber.Map{
		"list":  comments,
		"total": total,
	}))
}

func (cc *CommentController) GetCommentByID(c fiber.Ctx) error {
	comment, err := cc.CommentService.GetCommentByID(c.Context(), c.Params("id"))

	if err != nil {
		return err
	}

	return c.JSON(domain.SuccessResponse(comment))
}
