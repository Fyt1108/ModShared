import * as i18n from "@solid-primitives/i18n"
import { Accessor, createContext, createResource, createSignal, ParentComponent, Setter, useContext } from "solid-js"

type Locale = "zh" | "en"
type I18nContextType = {
    locale: Accessor<Locale>
    setLocale: Setter<Locale>
    t: any
    locales: { [key in Locale]: string }
}

const locales: { [key in Locale]: string } = {
    zh: "简体中文",
    en: "English",
}

const I18nContext = createContext<I18nContextType>()

export const I18nContextProvider: ParentComponent = (props) => {
    const [locale, setLocale] = createSignal<Locale>("zh")
    const [dict] = createResource(locale, fetchDictionary)
    dict()
    const t = i18n.translator(dict)

    return (
        <I18nContext.Provider value={{ locale, setLocale, t, locales }}>
            {props.children}
        </I18nContext.Provider>
    )
}

export const useI18nContext = () => {
    const context = useContext(I18nContext)
    if (!context) {
        throw new Error("useI18nContext must be used within an I18nContextProvider")
    }

    return context
}

const fetchDictionary = async (locale: Locale) => {
    const dict = (await import(`../i18n/${locale}.json`))
    return i18n.flatten(dict)
}