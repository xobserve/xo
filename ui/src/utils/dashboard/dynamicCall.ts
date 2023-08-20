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

import { setDateTime } from "components/DatePicker/DatePicker"
import { gnavigate } from "layouts/PageContainer"
import { setVariable } from "src/views/variables/SelectVariable"
import { $variables } from "src/views/variables/store"

// limitations under the License.
export const genDynamicFunction = (ast) => {
    try {
        const f =  eval("(" + ast +")")
        return f
    } catch (error) {
        return error
    }
}


export const commonInteractionEvent= (callback, data) => {
    return callback(data, gnavigate, (k, v) => setVariable(k, v), setDateTime, $variables)
}