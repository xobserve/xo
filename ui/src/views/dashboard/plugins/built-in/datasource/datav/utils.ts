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

import { PanelQuery } from "types/dashboard";
import { QueryPluginData } from "types/plugin";
import { isEmpty } from "utils/validate";
import { SpanLog, Trace, TraceSpan } from "../../panel/trace/types/trace";



// convert OpenTelemetry traces to Jaeger UI traces
export const queryPluginDataToTrace = (data: QueryPluginData, query: PanelQuery): Trace => {
    const trace: Trace = {} as any
    let errorsCount = 0
    const errorServices = new Set<string>()
    const servicesMap = {}
    const rootSpan: TraceSpan = JSON.parse(data.data.find(row => {
        const span = JSON.parse(row[2])
        return isEmpty(span.parentId)
    })[2])
    rootSpan.startTime = rootSpan.startTime / 1e3
    rootSpan.duration = rootSpan.duration / 1e3
    trace.traceID = rootSpan.traceId
    const spansMap = {}
    const spansPool = {}
    for (const row of data.data) {
        const span: TraceSpan = JSON.parse(row[2])
        span.startTime = span.startTime / 1e3
        span.duration = span.duration / 1e3
        span.relativeStartTime = span.startTime - rootSpan.startTime
        // console.log("here33333:", span.startTime, rootSpan.startTime, span.relativeStartTime)

        if (span.hasError) {
            errorsCount += 1
            errorServices.add(span.serviceName)
        }

        span.traceID = span.traceId
        span.spanID = span.spanId
        span.operationName = span.name
        const service = servicesMap[span.serviceName]
        if (!service) {
            servicesMap[span.serviceName] = {
                name: span.serviceName,
                numberOfSpans: 1
            }
        } else {
            service.numberOfSpans += 1
        }

        span.tags = []
        span.attributes = []
        span.resources = []
        if (span.resourcesMap) {
            Object.entries(span.resourcesMap).forEach(r => {
                span.resources.push(
                    {
                        "key": r[0],
                        "value": r[1]
                    }
                )
            })
        }
        if (span.stringAttributesMap) {
            Object.entries(span.stringAttributesMap).forEach(r => {
                span.attributes.push(
                    {
                        "key": r[0],
                        "value": r[1]
                    }
                )
            })
        }   
        if (span.numberAttributesMap) {
            Object.entries(span.numberAttributesMap).forEach(r => {
                span.attributes.push(
                    {
                        "key": r[0],
                        "value": r[1]
                    }
                )
            })
        }
        if (span.boolAttributesMap) {
            Object.entries(span.boolAttributesMap).forEach(r => {
                span.attributes.push(
                    {
                        "key": r[0],
                        "value": r[1]
                    }
                )
            })
        }
        spansMap[span.spanId] = span
        spansPool[span.spanId] = span
    }
    
    let done = false
    while (!done) {
        let hasParent = false
        Object.values(spansPool).forEach((span:TraceSpan) => {
            const parentSpan = spansMap[span.parentId]  
            if (parentSpan) {
                if (parentSpan.children) {
                    parentSpan.children.push(span)
                } else {
                    parentSpan.children = [span]
                }
                hasParent = true
                delete spansPool[span.spanId]
            }
        })

        if (!hasParent) {
            done = true
        }
    }

   
    
    const rootSpans: TraceSpan[] = Object.values(spansPool)
   
    rootSpans.sort((a: TraceSpan,b:TraceSpan) => a.startTime - b.startTime)
    const spans: TraceSpan[] = [...rootSpans]

    for (const rootSpan of rootSpans) {
        rootSpan.depth = 0
        spanTreeToList(rootSpan,spans)
    }

    trace.duration = rootSpan.duration
    trace.startTime = rootSpan.startTime
    trace.endTime = rootSpan.startTime + rootSpan.duration
    trace.errorsCount = errorsCount
    trace.errorServices = errorServices
    trace.spans = spans
    trace.services = Object.values(servicesMap)


    const serviceIndex = {}
    Object.keys(servicesMap).forEach((s,i) => {
        serviceIndex[s] = "p"+i
    })
    const processes = {}
    Object.entries(serviceIndex).forEach(v => {
        processes[v[1] as string] =
        { serviceName: v[0], tags: [] }
    })

    for (const span of spans) {
        if (!isEmpty(span.parentId)) {
            const parentSpan = spansMap[span.parentId]
            span.references = [{
                refType: 'CHILD_OF',
                spanID: span.parentId,
                traceID: span.traceId,
                span: parentSpan
            }]
        } else {
            span.references = []
        }
        
        const events = []
        if (span.events) {
            for (const eventStr of span.events) {
                const event = JSON.parse(eventStr as any)
                const log: SpanLog = {
                    timestamp: event.timeUnixNano / 1e3,
                    fields: [
                        {
                            "key": "event",
                            "value": event.name
                        }
                    ]
                }

                if (event.attributeMap) {
                    Object.entries(event.attributeMap).forEach(v => {
                        log.fields.push({
                            "key": v[0],
                            "value": v[1]
                        })
                    })
                }
            
                events.push(log)
            }
        }

        span.events = events
        const processId = serviceIndex[span.serviceName]

        if (span.hasError) {
            span.attributes.push({
                key: "error",
                value: true
            })
        }
        span.process = { serviceName: span.serviceName, tags: [] }
        span.processID = processId
    }

    trace.traceName = `${rootSpan.serviceName}: ${rootSpan.name}`
    trace.processes = processes
    return trace
}

export const spanTreeToList = (span: TraceSpan, totalSpans: TraceSpan[]) => {
    if (!span.children) {
        return 
    }
    span.hasChildren = true
    span.children.sort((a: TraceSpan,b:TraceSpan) => a.startTime - b.startTime)

    for (const s of span.children) {
        s.depth = span.depth + 1
        totalSpans.push(s)
        spanTreeToList(s,totalSpans)
    }
    delete span.children
}


export const queryPluginDataToTraceChart = (chart: QueryPluginData) => {
    let chartColumns = chart.columns
    const chartData = []
    const chartDataMap = {}
    
    if (chart) {
        if (chartColumns.length == 3) {
            // chartColumns = ["ts_bucket", "others", "errors"]
            for (const row of chart.data) {
                const ts = row[0]
                const v = chartDataMap[ts]
                if (!v) {
                    chartDataMap[ts] = {
                        [row[1]]: row[2]
                    }
                } else {
                    v[row[1]] = row[2]
                }
            }
            Object.keys(chartDataMap).forEach(ts => {
                const v = chartDataMap[ts]
                chartData.push([ts, v[false]??null, v[true]??null])
            })  
        } else if (chartColumns.length == 2) {
            chartData.push(...chart.data)
        }   
    }



    return {
        columns: chartColumns,
        data: chartData
    }
}