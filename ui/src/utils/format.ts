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

import { uniq } from "lodash";

// parse all the {{xxx}} to [xxx]
export const parseLegendFormat = (s) => {
    const reg = /{{(.*?)}}/g;
    const result = [];
    let match;
    while ((match = reg.exec(s))) {
        result.push(match[1]);
    }
    return uniq(result);
}

// parse all the ${xxx} to [xxx]
export const parseVariableFormat = (s) => {
    const reg = /\${(.*?)}/g;
    const result = [];
    let match;
    while ((match = reg.exec(s))) {
        result.push(match[1]);
    }
    return uniq(result);
}


// json to {a=b,c=d}
export const jsonToEqualPairs = v => {
    let s = "{"
    const keys = Object.keys(v)
    keys.forEach((k, i) => {
        if (i == keys.length - 1) {
            s = s + `${k}="${v[k]}"`
        } else {
            s = s + `${k}="${v[k]}",`
        }

    })

    s += "}"

    return s
}