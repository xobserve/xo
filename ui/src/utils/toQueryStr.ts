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

/**
 * 序列化url参数
 * ```ts
 * // 示例
 * toQueryStr({ id: 1, name: null, age: 18 })
 * // 输出 id=1&age=18
 * ```
 */
export const toQueryStr = (obj: any) => {
    if (obj) {
      for (const key in obj) {
        if (obj[key] === null || obj[key] === undefined) {
          delete obj[key]
        }
      }
      return new URLSearchParams(obj).toString()
    } else {
      return ''
    }
  }
  