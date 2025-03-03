package utils

import (
	"strings"

	"gorm.io/gorm"
)

// 通用LIKE转义
func EscapeLike(input string) string {
	return strings.ReplaceAll(
		strings.ReplaceAll(input, "%", "\\%"),
		"_", "\\_",
	)
}

// 安全排序字段
func SafeSortField(
	input string,
	allowedFields map[string]struct{},
	defaultField string,
) string {
	if _, valid := allowedFields[input]; valid {
		return input
	}
	return defaultField
}

// 安全排序方向
func SafeOrderDirection(input string) string {
	switch strings.ToLower(input) {
	case "asc":
		return "asc"
	case "desc":
		return "desc"
	default:
		return "desc" // 默认降序
	}
}

// 通用分页处理
func ApplyPaging(query *gorm.DB, page, pageSize int) *gorm.DB {
	if page > 0 && pageSize > 0 {
		return query.Offset((page - 1) * pageSize).Limit(pageSize)
	}
	return query
}
