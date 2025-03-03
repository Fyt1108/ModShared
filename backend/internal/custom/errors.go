package custom

type CustomError struct {
	code    Code
	message string
}

func (e CustomError) Error() string {
	return e.message
}

func (e CustomError) Code() Code {
	return e.code
}

func newCustomError(code Code, message string) *CustomError {
	return &CustomError{
		code:    code,
		message: message,
	}
}

var (
	UnknownError        = newCustomError(Unknown, "未知错误")
	DataNotExistError   = newCustomError(DataNotExist, "数据不存在")
	EmailExistError     = newCustomError(EmailExist, "邮箱已存在")
	UserExistError      = newCustomError(UserExist, "用户已存在")
	UserPassError       = newCustomError(UserPass, "用户名或密码错误")
	TokenInvalidError   = newCustomError(TokenInvalid, "token无效")
	CodeInvalidError    = newCustomError(CodeInvalid, "验证码无效")
	LoginRepeatError    = newCustomError(LoginRepeat, "重复登录")
	OriginPasswordError = newCustomError(OriginPassword, "原密码错误")
	UserDisabledError   = newCustomError(UserDisabled, "用户已被禁用")
)
