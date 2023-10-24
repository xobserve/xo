import { KeyValuePair } from "../built-in/panel/trace/types/trace"

export interface OpenTelemetryLog {
    id: string 
    timestamp: number 
    traceId: string 
    spanId: string
    severityText: string
    body: string

    namespace: string 
    service: string 
    host: string

    resources: [string,any][]
    attributes: [string,any][]
}