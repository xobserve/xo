// Copyright 2023 xObserve.io Team
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
export function prettyJson(code: any) {
    try {
      for (const key in code) {
        if (typeof code[key] === 'function') {
          let str = code[key];
          str = str.toString();
          code[key] = str.replace(/\n/g, '<br/>');
        }
      }
      // 设置缩进为2个空格
      let str = JSON.stringify(code, null, 2);
      str = str
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>');
      // str = str.replace(/\n/g, '/r')
      return str;
    } catch (e) {
      console.error('异常信息:' + e);
      return '';
    }
  }