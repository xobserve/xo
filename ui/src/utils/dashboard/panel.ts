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
import { AlertRules } from "src/views/dashboard/plugins/panel/alert/OverridesEditor";
import { BarRules } from "src/views/dashboard/plugins/panel/bar/OverridesEditor";
import { BarGaugeRules } from "src/views/dashboard/plugins/panel/barGauge/OverrideEditor";
import { GeomapRules } from "src/views/dashboard/plugins/panel/geomap/OverridesEditor";
import { GraphRules } from "src/views/dashboard/plugins/panel/graph/OverridesEditor";
import { StatRules } from "src/views/dashboard/plugins/panel/stat/OverridesEditor";
import { TableRules } from "src/views/dashboard/plugins/panel/table/OverridesEditor";
import { GridPos, OverrideItem, Panel, PanelType } from "types/dashboard";

export const updateGridPos = (panel: Panel, newPos: GridPos) => {
    panel.gridPos.x = newPos.x;
    panel.gridPos.y = newPos.y;
    panel.gridPos.w = newPos.w;
    panel.gridPos.h = newPos.h;
}


export const findOverrideRule = (panel: Panel, overideTarget, ruleType) => {
    const override: OverrideItem = findOverride(panel, overideTarget)
    return findRuleInOverride(override, ruleType)
}

export const findOverride = (panel: Panel, overideTarget) => {
    return panel.overrides.find((o) => o.target == overideTarget)
}

export const findRuleInOverride = (override: OverrideItem, ruleType) => {
    return override?.overrides.find((o) => o.type == ruleType)?.value
}


export const getPanelOverridesRules = (panelType): string[] => {
    //@needs-update-when-add-new-panel-overrides
    switch (panelType) {
        case PanelType.Graph:
            return Object.keys(GraphRules).map(k => GraphRules[k])
        case PanelType.Table:
            return Object.keys(TableRules).map(k => TableRules[k])
        case PanelType.BarGauge:
            return Object.keys(BarGaugeRules).map(k => BarGaugeRules[k])
        case PanelType.Stat:
            return Object.keys(StatRules).map(k => StatRules[k])
        case PanelType.GeoMap:
            return Object.keys(GeomapRules).map(k => GeomapRules[k])
        case PanelType.Bar:
            return Object.keys(BarRules).map(k => BarRules[k])
        default:
            return []
    }
}
