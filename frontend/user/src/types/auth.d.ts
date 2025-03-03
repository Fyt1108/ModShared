export type RegisterRequest = {
    username: string,
    email: string,
    password: string,
    confirm_password: string,
    code: string
}

export type LoginRequest = {
    username: string,
    password: string,
    captcha_id: string,
    captcha_code: string
}

export type ResetPasswordRequest = {
    token: string,
    password: string,
    confirm_password: string
}

export type ChangePasswordRequest = {
    old_password: string,
    new_password: string,
}