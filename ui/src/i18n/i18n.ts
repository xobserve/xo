import {get} from 'lodash'
import storage from 'utils/localStorage'
import enLocale from './locales/en.json'
import zhLocale from './locales/zh.json'
import { LangKey } from 'src/data/storage-keys'


export const lang = storage.get(LangKey) ?? "en"

export function t(str: string) {
  const locale = lang == "en" ? enLocale : zhLocale
  return get(locale, str)
}
