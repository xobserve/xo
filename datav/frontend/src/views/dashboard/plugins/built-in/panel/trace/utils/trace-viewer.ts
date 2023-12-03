// Copyright (c) 2020 The Jaeger Authors
//

import _memoize from 'lodash/memoize'
import { TraceSpan } from 'src/views/dashboard/plugins/built-in/panel/trace/types/trace'

export function _getTraceNameImpl(spans: TraceSpan[]) {
  // Use a span with no references to another span in given array
  // prefering the span with the fewest references
  // using start time as a tie breaker
  let candidateSpan: TraceSpan | undefined
  const allIDs: Set<string> = new Set(spans.map(({ spanID }) => spanID))

  for (let i = 0; i < spans.length; i++) {
    const hasInternalRef =
      spans[i].references &&
      spans[i].references.some(
        ({ traceID, spanID }) =>
          traceID === spans[i].traceID && allIDs.has(spanID),
      )
    if (hasInternalRef) continue

    if (!candidateSpan) {
      candidateSpan = spans[i]
      continue
    }

    const thisRefLength =
      (spans[i].references && spans[i].references.length) || 0
    const candidateRefLength =
      (candidateSpan.references && candidateSpan.references.length) || 0

    if (
      thisRefLength < candidateRefLength ||
      (thisRefLength === candidateRefLength &&
        spans[i].startTime < candidateSpan.startTime)
    ) {
      candidateSpan = spans[i]
    }
  }
  return candidateSpan
    ? `${candidateSpan.process.serviceName}: ${candidateSpan.operationName}`
    : ''
}

export const getTraceName = _memoize(
  _getTraceNameImpl,
  (spans: TraceSpan[]) => {
    if (!spans.length) return 0
    return spans[0].traceID
  },
)
