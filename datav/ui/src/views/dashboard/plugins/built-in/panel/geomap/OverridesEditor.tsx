
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

import ThresholdEditor from "src/views/dashboard/plugins/components/Threshold/ThresholdEditor";
import { EditorInputItem, EditorSliderItem } from "src/components/editor/EditorItem";
import React, { memo } from "react";
import { OverrideRule } from "types/dashboard";
import { getSeriesDataOverrideTargets } from "src/views/dashboard/utils/overrides";

interface Props {
    override: OverrideRule
    onChange: any
}

const GeomapOverridesEditor = ({ override, onChange }: Props) => {
    switch (override.type) {
        case GeomapRules.LocationName:
            return <EditorInputItem value={override.value} onChange={onChange} placeholder="change location name" />
        case GeomapRules.LocationFill:
            return <EditorSliderItem value={override.value} min={0} max={1} step={0.1} onChange={onChange} />
        case GeomapRules.LocationThresholds:
            return <ThresholdEditor value={override.value} onChange={onChange} />
        default:
            return <></>
    }

}
export default GeomapOverridesEditor

export enum GeomapRules {
    LocationName = "Location.displayName",
    LocationFill = "Location.fillOpacity",
    LocationThresholds = "Location.thresholds",
}

export const getGeomapOverrideTargets = (panel, data) => {
    return getSeriesDataOverrideTargets(data)    
}