import { Component, createMemo, createSignal } from "solid-js"
import { sendResetEmailAPI } from "../api/auth"
import { TimerButton } from "../components/TimerButton"
import { useI18nContext } from "../context/I18nContext"
import { useNotifyContext } from "../context/NotifyContext"

const SendResetEmail: Component = () => {
    const { t } = useI18nContext()
    const notify = useNotifyContext()

    const [startCountdown, setStartCountdown] = createSignal(false)
    const [email, setEmail] = createSignal('')

    const emailConstrain = createMemo(() => {
        const pattern = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/
        return pattern.test(email())
    })

    const sendRestEmail = async () => {
        if (!emailConstrain()) {
            notify.error(t('auth.emailConstrain'))
            return
        }

        try {
            await sendResetEmailAPI(email())
            setStartCountdown(true)
        } catch (e) {
            notify.error(e)
        }
    }

    return (
        <div class="m-auto">
            <div class="card sm:max-w-sm">
                <div class="card-body gap-8">
                    <h5 class="card-title">{t('auth.resetPassword')}</h5>
                    <p class="max-w-60">{t('auth.resetTips')}</p>
                    <div class="input-group max-w-sm">
                        <span class="input-group-text">
                            <span class="icon-[tabler--mail] text-base-content/80 size-5"></span>
                        </span>
                        <label class="sr-only" for="email">email</label>
                        <input type="email" class="input grow" placeholder={t('auth.emailPlaceholder')} id="email" required
                            onInput={(event) => setEmail(event.target.value)} maxlength="30" />
                    </div>
                </div>
                <div class="card-actions justify-center mb-10">
                    <TimerButton onClick={sendRestEmail} class="btn btn-primary text-white"
                        text={t('auth.sendRecoveryEmail')} icon="icon-[tabler--brand-telegram]" start={startCountdown} setStart={setStartCountdown} />
                </div>
            </div>
        </div>

    )
}

export default SendResetEmail