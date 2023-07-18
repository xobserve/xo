// Copyright 2023 Datav.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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