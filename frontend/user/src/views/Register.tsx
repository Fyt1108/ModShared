import { useNavigate } from "@solidjs/router"
import { Component, createMemo, createSignal } from "solid-js"
import { createStore } from "solid-js/store"
import { registerAPI, verifyAPI } from "../api/auth"
import { PasswordInput } from "../components/PasswordInput"
import { PasswordStrength } from "../components/PasswordStrength"
import { TimerButton } from "../components/TimerButton"
import { useI18nContext } from "../context/I18nContext"
import { useNotifyContext } from "../context/NotifyContext"
import { RegisterRequest } from "../types/auth"

const Register: Component = () => {
    const { t } = useI18nContext()
    const notify = useNotifyContext()
    const navigate = useNavigate()

    const [registerInput, setRegisterInput] = createStore<RegisterRequest>({
        username: "",
        email: "",
        password: "",
        confirm_password: "",
        code: ""
    })
    const [startCountdown, setStartCountdown] = createSignal(false)

    //验证
    const isPasswordMatch = createMemo(() => registerInput.password === registerInput.confirm_password)
    const isMinUserName = createMemo(() => registerInput.username.length >= 4)
    const emailConstrain = createMemo(() => {
        const pattern = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/
        return pattern.test(registerInput.email)
    })
    const passwordStrength = createMemo(() => {
        const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/
        return pattern.test(registerInput.password)
    })

    //注册方法
    const register = async (event: SubmitEvent) => {
        event.preventDefault()
        const validateInputs = () => {
            if (!isMinUserName()) {
                notify.error(t('auth.usernameLength'))
                return false
            }
            if (!emailConstrain()) {
                notify.error(t('auth.emailConstrain'))
                return false
            }
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
            await registerAPI(registerInput)
            notify.success(t('auth.registerSuccess'))
            navigate("/login")
        } catch (e) {
            notify.error(e)
        }
    }

    //发送验证码
    const verify = async () => {
        if (!emailConstrain()) {
            notify.error(t('auth.emailConstrain'))
            return
        }

        try {
            await verifyAPI(registerInput.email)
            setStartCountdown(true)
        } catch (e) {
            notify.error(e)
        }
    }

    return (
        <div class="m-auto">
            <div class="card sm:max-w-sm">
                <form onSubmit={register}>
                    <div class="card-body gap-6">
                        <h5 class="card-title">{t('auth.register')}</h5>
                        <div class="input-group max-w-xs">
                            <span class="input-group-text">
                                <span class="icon-[tabler--user-scan] text-base-content/80 size-5"></span>
                            </span>
                            <label class="sr-only" for="userName">username</label>
                            <input name="username" type="text" class="input grow"
                                placeholder={t('auth.usernamePlaceholder2')} id="userName" required
                                onInput={(event) => setRegisterInput("username", event.target.value)} maxlength="20" />
                        </div>
                        <div class="input-group max-w-sm">
                            <span class="input-group-text">
                                <span class="icon-[tabler--mail] text-base-content/80 size-5"></span>
                            </span>
                            <label class="sr-only" for="email">email</label>
                            <input name="email" type="email" class="input grow" placeholder={t('auth.emailPlaceholder')}
                                id="email" required onInput={(event) => setRegisterInput("email", event.target.value)} maxlength="30" />
                        </div>
                        <div class="input-group max-w-sm">
                            <span class="input-group-text">
                                <span class="icon-[tabler--key] text-base-content/80 size-5"></span>
                            </span>
                            <label class="sr-only" for="password">password</label>
                            <PasswordInput id="password" placeholder={t('auth.passwordPlaceholder')} onInput={(event) => setRegisterInput("password", event.target.value)} />
                            <PasswordStrength target="#password" translator={t} />
                        </div>
                        <div class="input-group max-w-sm">
                            <span class="input-group-text">
                                <span class="icon-[tabler--key] text-base-content/80 size-5"></span>
                            </span>
                            <label class="sr-only" for="confirmPassword">confirmPassword</label>
                            <PasswordInput id="confirmPassword" placeholder={t('auth.passwordPlaceholder2')} onInput={(event) => setRegisterInput("confirm_password", event.target.value)} />
                        </div>
                        <div class="join max-w-80">
                            <div class="input-group join-item">
                                <span class="input-group-text">
                                    <span class="icon-[tabler--abc] text-base-content/80 size-5"></span>
                                </span>
                                <label class="sr-only" for="code">code</label>
                                <input name="code" type="text" class="input grow" placeholder={t('auth.codePlaceholder')}
                                    id="confirmPassword" required onInput={(event) => setRegisterInput("code", event.target.value)} maxlength="10" />
                            </div>
                            <TimerButton class="btn-secondary join-item h-auto text-white" onClick={verify} text={t('get')} start={startCountdown} setStart={setStartCountdown} />
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

export default Register