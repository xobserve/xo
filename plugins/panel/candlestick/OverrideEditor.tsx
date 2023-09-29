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

import { EditorInputItem } from "src/components/editor/EditorItem";
import { OverrideRule } from "types/dashboard";
import React from "react";
import { ColorPicker } from "components/ColorPicker";
import { palettes } from "utils/colors";

interface Props {
    override: OverrideRule
    onChange: any
}


const OverrideEditor = (props: Props) => {
    const { override, onChange } = props
    switch (override.type) {
        case OverrideRules.SeriesName:
            return <EditorInputItem value={override.value} onChange={onChange} placeholder="change series name" />
        case OverrideRules.SeriesColor:
            return <ColorPicker color={override.value} onChange={onChange} defaultColor={palettes[0]} />
        default:
            return <></>
    }
}

export default OverrideEditor

export enum OverrideRules {
    // basic
    SeriesName = 'Series.displayName',
    SeriesColor = "Series.color"
}

// Get override targets names and values or overrides `Target name` selector
// e.g
/*
const res = []
const d: SeriesData[] = flatten(data)
    if (d.length > 0) {
        if (isArray(d[0].fields)) {
            for (const f of d[0].fields) {
                res.push({
                    label: f.name,
                    value: f.name
                })
            }
        }
    }
}
*/
// The above example will get targets from SeriesData, Table and Graph panels are using this method to get targets
// If return [] or null or undefined, Datav will use the default function to get override targets
export const getOverrideTargets = (panel, data) => {
    // for demonstration purpose, we just return a hard coded targets list
    return ['Volume','MA5','MA10','MA20','MA30']
}