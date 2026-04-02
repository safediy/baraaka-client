import { ref } from 'vue'
import uz from './uz.json'
import en from './en.json'
import ru from './ru.json'
import zh from './zh.json'
import { createI18n } from 'vue-i18n'
import { LocaleLanguage } from 'types/common'
import { getActiveLang, setActiveLang } from '@/utils/cache/local-storage'

const activeLangName = ref<LocaleLanguage>(getActiveLang())

const i18n = createI18n({
  locale: activeLangName.value,
  fallbackLocale: activeLangName.value,
  messages: { zh, uz, en, ru },
  legacy: false
})

export const changeLocale = (language: LocaleLanguage) => {
  i18n.global.locale.value = language
  setActiveLang(language)
}

export default i18n
