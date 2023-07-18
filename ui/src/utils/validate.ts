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

import  { isArray, isObject,isEmpty as _isEmpty } from 'lodash'

export function isEmpty(value){
    if(value === null || value === '' || value === undefined){
        return true
    } 

    if (isArray(value) || isObject(value)){
        return _isEmpty(value)
    }
    
    return false
}