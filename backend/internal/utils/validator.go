package utils

import "github.com/go-playground/validator/v10"

//验证器工具

// 验证器结构体
type StructValidator struct {
	Validator *validator.Validate
}

//验证方法
func (v *StructValidator) Validate(out any) error {
	return v.Validator.Struct(out)
}
