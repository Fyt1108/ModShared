import { AxiosError } from "axios"
import { Notyf } from "notyf"
import { createContext, ParentComponent, useContext } from "solid-js"
import { useI18nContext } from "./I18nContext"

const NotifyContext = createContext<Notify>()

export const NotifyContextProvider: ParentComponent = (props) => {
    const notyf = new Notyf({
        duration: 3000,
        position: {
            x: 'right',
            y: 'bottom'
        }
    })
    const { t } = useI18nContext()

    const notifyInstance = new Notify(notyf, t)

    return (
        <NotifyContext.Provider value={notifyInstance}>
            {props.children}
        </NotifyContext.Provider>
    )
}

export const useNotifyContext = () => {
    const notifyInstance = useContext(NotifyContext)
    if (!notifyInstance) {
        throw new Error("useNotifyContext must be used within a NotifyContextProvider")
    }
    return notifyInstance
}

class Notify {
    private notyf: any
    private t: any
    constructor(notyf: Notyf, t: any) {
        this.notyf = notyf
        this.t = t
    }

    success = (message: string) => {
        this.notyf.success(message)
    }

    error = (err: unknown) => {
        //判断类似是否为String类型
        if (typeof err === 'string') {
            this.notyf.error(err)
            return
        }

        const axiosErr = err as AxiosError
        if (axiosErr.response) {
            const res = axiosErr.response.data as ApiResponse<null>

            switch (res.code) {
                case 2:
                    this.notyf.error(this.t('noData'))
                    return
                case 3:
                    this.notyf.error(this.t('auth.emailExist'))
                    return
                case 4:
                    this.notyf.error(this.t('auth.usernameExist'))
                    return
                case 5:
                    this.notyf.error(this.t('auth.loginFail'))
                    return
                case 7:
                    this.notyf.error(this.t('auth.codeError'))
                    return
                default:
                    this.notyf.error(this.t('serverError') + ":" + res.error)
                    return
            }
        } else if (axiosErr.request) {
            this.notyf.error(this.t('connectError'))
            return
        } else {
            this.notyf.error(this.t('unknownError') + ":" + err)
        }
    }
}
