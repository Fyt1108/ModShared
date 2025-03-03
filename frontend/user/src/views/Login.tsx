import { A, createAsync, useNavigate } from "@solidjs/router"
import { Component, createEffect, createMemo, createSignal } from "solid-js"
import { createStore } from "solid-js/store"
import { getCaptchaAPI, loginAPI } from "../api/auth"
import { getUserBySelfAPI } from "../api/user"
import { PasswordInput } from "../components/PasswordInput"
import { useI18nContext } from "../context/I18nContext"
import { useNotifyContext } from "../context/NotifyContext"
import { useAuthStore } from "../stores/auth"
import { LoginRequest } from "../types/auth"

const Login: Component = () => {
    const { t } = useI18nContext()
    const notify = useNotifyContext()
    const navigate = useNavigate()
    const [flag, setFlag] = createSignal(false)

    const [loginInput, setLoginInput] = createStore<LoginRequest>({
        username: "",
        password: "",
        captcha_id: "",
        captcha_code: ""
    })
    const [reload, setReload] = createSignal(false)

    const capData = createAsync(() => getCaptchaAPI(reload()))
    const capID = createMemo(() => {
        return capData()?.data?.captcha_id
    })

    const login = async (event: SubmitEvent) => {
        event.preventDefault()
        setLoginInput('captcha_id', capID()!)
        try {
            await loginAPI(loginInput)
            useAuthStore().setIsLogin(true)
            setFlag(true)
            notify.success(t('auth.loginSuccess'))
            navigate("/")
        } catch (e) {
            setReload(!reload())
            notify.error(e)
        }
    }
    createEffect(async () => {
        if (flag()) {
            try {
                const profileData = await getUserBySelfAPI()
                useAuthStore().setProfile(profileData.data)
            } catch (e) {
                notify.error(e)
            }
        }
    })

    return (
        <div class="m-auto">
            <div class="card sm:max-w-sm">
                <form onSubmit={login}>
                    <div class="card-body gap-8">
                        <h5 class="card-title">{t('auth.login')}</h5>
                        <div class="input-group max-w-sm">
                            <span class="input-group-text">
                                <span class="icon-[tabler--user-scan] text-base-content/80 size-5"></span>
                            </span>
                            <label class="sr-only" for="userName">username</label>
                            <input type="text" class="input grow" placeholder={t('auth.usernamePlaceholder')} id="userName"
                                required onInput={(event) => setLoginInput('username', event.target.value)} maxlength="30" />
                        </div>
                        <div class="input-group max-w-sm">
                            <span class="input-group-text">
                                <span class="icon-[tabler--key] text-base-content/80 size-5"></span>
                            </span>
                            <label class="sr-only" for="password">password</label>
                            <PasswordInput id="password" placeholder={t('auth.passwordPlaceholder')} onInput={(event) => setLoginInput('password', event.target.value)} />
                        </div>
                        <div class="input-group max-w-sm">
                            <span class="input-group-text">
                                <span class="icon-[tabler--abc] text-base-content/80 size-5"></span>
                            </span>
                            <input type="text" class="input grow" placeholder={t('auth.captchaPlaceholder')} onInput={(e) => setLoginInput('captcha_code', e.target.value)} maxlength="4" required />
                            <img src={capData()?.data?.captcha} alt="captcha" width={150} onClick={() => {
                                setReload(!reload())
                            }}
                                class="hover:cursor-pointer" />
                        </div>

                    </div>
                    <div class="card-actions justify-center mb-10">
                        <button class="btn btn-primary" type="submit">
                            <p class="text-white text-xl">{t('auth.login')}</p>
                            <span class="icon-[tabler--arrow-big-right] size-5 text-white"></span>
                        </button>
                    </div>
                </form>
                <div class="card-footer flex justify-between">
                    <A href="/register" class="link link-primary no-underline"> {t('auth.createAccount')}</A>
                    <A href="/reset-password" class="link link-primary no-underline">{t('auth.forgotPassword')}</A>
                </div>
            </div >
        </div >
    )
}

export default Login