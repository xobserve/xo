import { extend } from "lodash";
import { Field } from "types/seriesData";
import { OpenTelemetryLog } from "../types/opentelemetry";

export const seriesFieldsToOpenTelemetryLog = (fields: Field[]): Partial<OpenTelemetryLog> =>  {
    const log: Partial<OpenTelemetryLog> = {
        resources: [],
        attributes: []
    }
    for (const f of fields) {
        switch (f.name) {
            case "id":
                log.id = f.values[0]
                break
            case "timestamp":
                log.timestamp= f.values[0]
                break
            case "trace_id":
                log.traceId = f.values[0]
                break
            case "span_id":
                log.spanId = f.values[0]
                break
            case "severity_text":
                log.severityText= f.values[0]
                break
            case "body":
                log.body = f.values[0]
                break
            case "_namespace":
                log.namespace = f.values[0]
                break
            case "_service":
                log.service= f.values[0]
                break
            case "_host":
                log.host = f.values[0]
                break
            case "resources_string": 
                Object.entries(f.values[0]).map(v => {
                    log.resources.push(v)
                })
                
                break
            case "attributes_string":
            case "attributes_float64":
            case "attributes_int64":
                Object.entries(f.values[0]).map(v => {
                    log.attributes.push(v)
                })
                break
            default:
        }
    }

    return log
}