import { createI18n } from 'vue-i18n'
import en from './en.json'
import zh from './zh.json'

const i18n = createI18n({
    legacy: false,
    locale: localStorage.getItem('language') || 'zh',
    fallbackLocale: 'en',
    messages: {
        zh,
        en
    }
})

export default i18n 