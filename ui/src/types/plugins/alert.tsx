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

import { AlertState } from "types/alert"
import { DatasourceType } from "types/dashboard"

// limitations under the License.
export interface AlertToolbarOptions {
    maxBars: number
    barType: "labels" | "total"
    viewMode?: "list" | "stat"
    persist: boolean
    stateFilter?: AlertState[]
    ruleNameFilter?: string
    ruleLabelsFilter?: string
    labelNameFilter?: string
}

export interface AlertGroup {
    name: string
    file: string
    rules: AlertRule[]
    evaluationTime: number,
    lastEvaluation: string
    interval: number
    limit: number
}


export interface AlertRule {
    name: string
    state: AlertState
    type: "alerting" | "recording"
    query: string 
    duration: number
    keepFiringFor: number
    labels: Record<string, string>
    annotations: Record<string, string>
    alerts: Alert[]
    health: "ok" | "error"
    lastEvaluation: string
    evaluationTime: number
    activeAt: string

    groupName: string 
    groupNamespace: string 
    fromDs: DatasourceType
}

export interface Alert {
    name: string
    labels: Record<string, string>
    annotations: Record<string, string>
    state: AlertState
    activeAt: string
    value: number
}
