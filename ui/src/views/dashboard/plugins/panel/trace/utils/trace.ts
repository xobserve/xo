import { KeyValuePair, Trace } from "types/plugins/trace";

export const isErrorTag = ({ key, value }: KeyValuePair) =>
    key === 'error' && (value === true || value === 'true');

export const isErrorTrace = (t: Trace): boolean =>
    t.spans.some(span => span.tags.some(isErrorTag))

