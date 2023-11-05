// Copyright 2023 observex.io Team
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
import moment from "moment";
import { isEmpty } from "./validate";

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


// json to {a="b",c="d"}
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

export const equalPairsToJson = (s0):Record<string,string> => {
    const s = s0.trim()
    if (isEmpty(s)) {
        return null
    }
    
    if (s[0] !== "{" || s[s.length - 1] !== "}") {
        return null
    }

    try {
        const v = {}
        const pairs = s.slice(1,s.length-1).split(",")
        pairs.forEach(p => {
            const kv = p.split("=")
            v[kv[0]] = kv[1].slice(1, kv[1].length-1)
        })
    
        return v
    } catch (error) {
        console.error("equal pairs convert to json error", s0, error)
        return null
    }
  
}


// json to {"a"="b","c"="d"}
export const jsonToEqualPairs1 = v => {
    let s = "{"
    const keys = Object.keys(v)
    keys.forEach((k, i) => {
        if (i == keys.length - 1) {
            s = s + `"${k}"="${v[k]}"`
        } else {
            s = s + `"${k}"="${v[k]}",`
        }

    })

    s += "}"

    return s
}


// start, end : ms
// step: second
export const getTimeFormatForChart = (start, end, step?) => {
    const mstart = moment(start)
    const mend = moment(end)
    const now = moment()
    let format;
    
    const isSameYear = now.isSame(mend, "year") && now.isSame(mstart, "year")
    const isSameMonth = now.isSame(mend, "month") && now.isSame(mstart, "month")
    const isSameDay = now.isSame(mend, "day") && now.isSame(mstart, "day")

    if (isSameYear) {
        format = ""
    } else {
        format = "YYYY-"
    }

    if (isSameYear && isSameMonth) {
        format += ""
    } else {
        format += "M-"
    }

    if (isSameYear && isSameMonth && isSameDay) {
        format += "HH:mm"
    } else {
        format += "DD HH:mm"
    }

    if (step && step < 60) {
        format += ":ss"
    }

    return format
}