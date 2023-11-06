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
import { ColorPicker } from "src/components/ColorPicker";
import { EditorInputItem} from "src/components/editor/EditorItem";
import { OverrideRule } from "types/dashboard";
import React from "react";
import { palettes } from "utils/colors";
import { getSeriesDataOverrideTargets } from "src/views/dashboard/utils/overrides";

interface Props {
    override: OverrideRule
    onChange: any
}


const PieOverridesEditor = ({ override, onChange }: Props) => {
    switch (override.type) {
        case PieRules.SeriesName:
            return <EditorInputItem value={override.value} onChange={onChange} placeholder="change series name" />
        case PieRules.SeriesColor:
            return <ColorPicker color={override.value} onChange={onChange} defaultColor={palettes[0]} />
        default:
            return <></>
    }

}

export default PieOverridesEditor


export enum PieRules {
    SeriesName = 'Series.displayName',
    SeriesColor= 'Series.color',
}

export const getPieOverrideTargets = (panel, data) => {
    return getSeriesDataOverrideTargets(data)    
}