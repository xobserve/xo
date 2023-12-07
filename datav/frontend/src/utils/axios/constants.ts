// Copyright 2023 xobserve.io Team
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

export const HOUR = 3600
export const DAY = 86400
export const MIN = 60
export const WAIT = 100

export const COOKIE_MAX_AGE = DAY * 30

export const LS_KEY = {
  LOG: '__DEV__',
} as const

export const KEYS = {
  error: '$error',
  token: 'X-Token',
} as const
