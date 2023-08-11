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

import { cloneDeep, round } from "lodash";
import React, { useMemo } from "react";
import { initPanelPlugins } from "src/data/panel/initPlugins";
import { PanelProps, PanelType } from "types/dashboard";
import StatPanel from "../../stat/Stat";
import { Field, FieldType, SeriesData } from "types/seriesData";
import { AlertRule } from "types/plugins/alert";
import { ValueCalculationType } from "types/value";
import { VarialbeAllOption } from "src/data/variable";
import { prometheusToSeriesData } from "../../../datasource/prometheus/transformData";
import { calcStep } from "./Chart";

const AlertStatView = (props: PanelProps) => {

    const newProps = cloneDeep(props)
    const statOptions = initPanelPlugins().stat
    statOptions.value.calc = ValueCalculationType.Sum
    statOptions.value.decimal = 0
    statOptions.displaySeries = VarialbeAllOption
    statOptions.showGraph = props.panel.plugins.alert.stat.showGraph
    statOptions.styles.connectNulls = true
    statOptions.styles.showPoints = true
    statOptions.styles.layout = props.panel.plugins.alert.stat.layout
    statOptions.styles.colorMode = props.panel.plugins.alert.stat.colorMode
    statOptions.styles.style =  props.panel.plugins.alert.stat.style
    statOptions.textSize.value = 100
    statOptions.showLegend = true
    newProps.panel.plugins.stat = statOptions


    // "data": {
    //     "resultType": "matrix",
    //     "result": [
    //         {
    //             "metric": {
    //                 "cpu": "user",
    //                 "instance": "localhost:9100",
    //             },
    //             "values": [
    //             ]
    //         },
    const data: SeriesData[] = useMemo(() => {
        const promFormatData = {
            resultType: "matrix",
            result: [
                {
                    "metric": {
                        "alerts": "total"
                    },
                    "values": [

                    ]
                }
            ]
        }

        const timeMap = new Map()
        for (const rule0 of props.data) {
            const rule: AlertRule = rule0
 
            for (const alert of rule.alerts) {
                const ts = round(new Date(alert.activeAt).getTime()/1000)
                const t = timeMap.get(ts)??0
                timeMap.set(ts, t + 1)
            }
        }

        const timeline = Array.from(timeMap.keys()).sort()
        for (const ts of timeline) {
            promFormatData.result[0].values.push([ts, timeMap.get(ts)])
        }

        const data: SeriesData[] = prometheusToSeriesData(promFormatData, {
            id: 65,
            legend: '',
            interval: null
        } as any,newProps.timeRange,true)

        data[0].name = "Alerts"
        return data
    }, [props.data])
    
    newProps.data = [data]
    newProps.panel.type = PanelType.Stat
    newProps.panel.overrides = [  {
        "target": "Alerts",
        "overrides": [
          {
            "type": "Series.thresholds",
            "value": {
              "mode": "absolute",
              "thresholds": [
                {
                  "color": props.panel.plugins.alert.stat.color,
                  "value": null
                }
              ]
            }
          }
        ]
      }]
    console.log("here33333#:", newProps)
    //@ts-ignore
    return (<StatPanel  {...newProps} />)
}

export default AlertStatView