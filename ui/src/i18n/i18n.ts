import { persistentAtom } from '@nanostores/persistent'

import { browser, createI18n, formatter, localeFrom } from '@nanostores/i18n'

export let localeSetting = persistentAtom('locale')

export let locale = localeFrom(
  localeSetting,
  browser({ 
    available: ['en', 'zh'],
    fallback: 'en'
  })
)

export let i18n = createI18n(locale, {
  async get(code) {
    if (code === 'zh') {
      return (await import('./locales/zh.json')).default
    }
  }
})

export let format = formatter(locale)