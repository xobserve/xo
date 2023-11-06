import { KeyValuePair, Trace } from "src/views/dashboard/plugins/built-in/panel/trace/types/trace";

export const isErrorTag = ({ key, value }: KeyValuePair) =>
    key === 'error' && (value === true || value === 'true');

export const isErrorTrace = (t: Trace): boolean => {
    return t.errorsCount > 0
}



export const isTraceData = (data: any[]) => {
    for (const s of data) {
        if (s.traceID) {
            return true
        }
    }
    return false
}



export const getShortTraceId = (traceId: string) => {
    return traceId.slice(traceId.length - 7, traceId.length)
}