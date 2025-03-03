import { useNavigate, useParams } from "@solidjs/router"
import { Component, createMemo } from "solid-js"
import { createStore } from "solid-js/store"
import { resetPasswordAPI } from "../api/auth"
import { PasswordInput } from "../components/PasswordInput"
import { PasswordStrength } from "../components/PasswordStrength"
import { useI18nContext } from "../context/I18nContext"
import { useNotifyContext } from "../context/NotifyContext"
import { ResetPasswordRequest } from "../types/auth"

const ResetPassword: Component = () => {
    const { t } = useI18nContext()
    const notify = useNotifyContext()
    const navigate = useNavigate()
    const params = useParams()

    const [passwordInput, setPasswordInput] = createStore<ResetPasswordRequest>({
        token: params.token,
        password: "",
        confirm_password: ""
    })

    const passwordStrength = createMemo(() => {
        const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/
        return pattern.test(passwordInput.password)
    })
    const isPasswordMatch = createMemo(() => passwordInput.password === passwordInput.confirm_password)

    const resetPassword = async (event: SubmitEvent) => {
        event.preventDefault()
        const validateInputs = () => {
            if (!passwordStrength()) {
                notify.error(t('auth.passwordStrength'))
                return false
            }
            if (!isPasswordMatch()) {
                notify.error(t('auth.passwordMatch'))
                return false
            }
            return true
        }

        if (!validateInputs()) {
            return
        }

        try {
            await resetPasswordAPI(passwordInput)
            notify.success(t('auth.resetPasswordSuccess'))
            navigate('/login')
        } catch (e) {
            notify.error(e)
        }
    }

    return (
        <div class="m-auto">
            <div class="card sm:max-w-sm">
                <form onSubmit={resetPassword}>
                    <div class="card-body gap-6">
                        <h5 class="card-title">{t('auth.resetPassword')}</h5>
                        <div class="input-group max-w-sm">
                            <span class="input-group-text">
                                <span class="icon-[tabler--key] text-base-content/80 size-5"></span>
                            </span>
                            <label class="sr-only" for="password">password</label>
                            <PasswordInput id="password" placeholder={t('auth.passwordPlaceholder')} onInput={(event) => setPasswordInput('password', event.target.value)} />
                            <PasswordStrength target="#password" translator={t} />
                        </div>
                        <div class="input-group max-w-sm">
                            <span class="input-group-text">
                                <span class="icon-[tabler--key] text-base-content/80 size-5"></span>
                            </span>
                            <label class="sr-only" for="password">confirmPassword</label>
                            <PasswordInput id="confirmPassword" placeholder={t('auth.passwordPlaceholder2')} onInput={(event) => setPasswordInput("confirm_password", event.target.value)} />
                        </div>
                    </div>
                    <div class="card-actions justify-center mb-10">
                        <button class="btn btn-primary" type="submit">
                            <p class="text-white text-xl">{t('confirm')}</p>
                            <span class="icon-[tabler--arrow-big-right] size-5 text-white"></span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ResetPassword