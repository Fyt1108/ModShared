package utils

import "golang.org/x/crypto/bcrypt"

//密码加密与验证,采用Bcrypt加密
//Bcrypt:一种用于密码哈希的加密算法,它是基于Blowfish算法的加强版,采用Salt和Cost机制,可以抵抗暴力破解和彩虹表攻击

func HashPassword(pwd string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(pwd), 12)
	return string(hash), err
}

func CheckPassword(pwd string, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(pwd))
	return err == nil
}
