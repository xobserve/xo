import { KeyValuePair, Trace } from "types/plugins/trace";

export const isErrorTag = ({ key, value }: KeyValuePair) =>
    key === 'error' && (value === true || value === 'true');

export const isErrorTrace = (t: Trace): boolean =>
    t.spans.some(span => span.tags.some(isErrorTag))



export const isTraceData = (d: any) => {
    const data: Trace[] = d?.flat()
    for (const s of data) {
        if (s.traceID) {
            return true
        }
    }
    return false
}

