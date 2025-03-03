package custom

type Code uint8

const (
	OK Code = iota // 请求成功

	Unknown // 未知错误

	DataNotExist // 数据不存在

	EmailExist // 邮箱已存在

	UserExist // 用户已存在

	UserPass // 用户密码错误

	TokenInvalid // token无效

	CodeInvalid //验证码无效

	LoginRepeat //重复登录

	OriginPassword //原始密码错误

	UserDisabled //用户被禁用
)
