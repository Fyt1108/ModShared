package utils

import (
	"errors"

	"github.com/golang-jwt/jwt/v5"
)

// JWT工具包
var signingMethod = jwt.SigningMethodHS256 // 签名方法

// 生成JWT
func GenerateJWT(id string, role string, expirationTime int64, secret string) (string, error) {
	//设置声明
	token := jwt.NewWithClaims(signingMethod, jwt.MapClaims{
		"id":   id,
		"role": role,
		"exp":  expirationTime,
	})
	//签名
	signedToken, err := token.SignedString([]byte(secret))

	return "Bearer " + signedToken, err
}

// 解析JWT
func ParseJWT(tokenString string, secret string) (string, string, error) {
	// 去除前缀
	if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
		tokenString = tokenString[7:]
	}

	// 解析token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// 确保token的签名方法是所期望的
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(secret), nil
	})

	// 解析token是否发生错误
	if err != nil {
		return "", "", err
	}

	// 检查token是否有效
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		id, ok := claims["id"].(string) //获取用户id
		if !ok {
			return "", "", errors.New("username claims is not a string")
		}

		role, ok := claims["role"].(string) //获取用户角色
		if !ok {
			return "", "", errors.New("role claims is not a string")
		}

		return id, role, nil
	}
	return "", "", errors.New("invalid token")
}
