import { persistentAtom } from '@nanostores/persistent'

import { browser, createI18n, formatter, localeFrom } from '@nanostores/i18n'
import { storageKey } from 'utils/localStorage'

export const localeSetting = persistentAtom(storageKey + 'locale')

export const locale = localeFrom(
  localeSetting,
  browser({ 
    available: ['en', 'zh'],
    fallback: 'en'
  })
)

export const i18n = createI18n(locale, {
  async get(code) {
    if (code === 'zh') {
      return (await import('./locales/zh.json')).default
    }
  }
})

export const format = formatter(locale)