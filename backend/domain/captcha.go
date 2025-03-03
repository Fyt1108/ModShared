package domain

type CaptchaResponse struct {
	CaptchaID string `json:"captcha_id"`
	Captcha   string `json:"captcha"`
}
