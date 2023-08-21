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

import { TimeRange } from "types/time";
import {cloneDeep, random, round} from 'lodash'
import { PanelDatasource, PanelQuery } from "types/dashboard";

const rawData = {
    "status": "success",
    "data": {
        "resultType": "matrix",
        "result": [
            {
                "metric": {
                    "cpu": "user",
                    "instance": "localhost:9100",
                },
                "values": [
                ]
            },
            {
                "metric": {
                    "cpu": "user",
                    "instance": "localhost:9101",
                },
                "values": [
                ]
            },
            {
                "metric": {
                    "cpu": "user",
                    "instance": "localhost:9102",
                },
                "values": [
                    
                ]
            },
            // {
            //     "metric": {
            //         "cpu": "0",
            //         "instance": "localhost:9100",
            //         "job": "node",
            //         "mode": "user"
            //     },
            //     "values": [
            //     ]
            // },
            // {
            //     "metric": {
            //         "cpu": "1",
            //         "instance": "localhost:9100",
            //         "job": "node",
            //         "mode": "idle"
            //     },
            //     "values": [
            //     ]
            // },
            // {
            //     "metric": {
            //         "cpu": "1",
            //         "instance": "localhost:9100",
            //         "job": "node",
            //         "mode": "nice"
            //     },
            //     "values": [
            //     ]
            // }
        ]
    }
}

export const genPrometheusData = (timeRange: TimeRange,ds: PanelDatasource,q: PanelQuery) => {
    const data = cloneDeep(rawData)
    const start = round(timeRange.start.getTime() / 1000 )
    const end = round(timeRange.end.getTime() / 1000) 
    const alignedStart = start - start % q.interval
    const timeBucks = []
    let current = alignedStart;
    while (current <= end) {
        timeBucks.push(current)
        current += q.interval        
    }

   for (const r of data.data.result) {
        const max = random(0, 10, true)
        for (const t of timeBucks) {
            r.values.push([round(t), random(0, max, true)])
        }
   }

   return data.data
}   