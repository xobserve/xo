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
import { AlertState } from "types/alert"
import { PanelQuery } from "types/dashboard"
import { ValueCalculationType } from "types/value"

/*-------------------- Plugins ----------------------- */

export interface DisableDatasource {
    disableDatasource?: boolean
}

export interface AlertFilter {
    enableFilter: boolean
    state: AlertState[]
    datasources: number[]
    httpQuery: PanelQuery
    ruleName: string
    ruleLabel: string
    alertLabel: string
}


export enum ThresholdDisplay {
    None = "None",
    Line = "Line",
    DashedLine = "Dashed Line",
    Area = "Area",
    AreaLine = "Area Line",
    AreaDashedLine = "Area Dashed Line"
}


export interface ValueSetting extends Units {
    decimal: number
    calc?: ValueCalculationType
}

export type UnitsType = 'none' | 'time' | 'bytes' | 'percent' | 'short' | 'format' | "enum" | 'custom';
export interface Unit {
    operator: "x" | "/" | "=",
    rhs: number,
    unit: string
}

export interface Units {
    unitsType: UnitsType,
    units: Unit[],
}


export interface NodeGraphData {
    nodes: Node[]
    edges:  Edge[]
  }

export interface Node   {
    id: string 
    label: string
    data: {
        [key:string]:number
    }
}

export interface Edge  {
    source: string // source node id
    target: string // target node id
    label: string
    data: {
        [key:string]:number
    }
}