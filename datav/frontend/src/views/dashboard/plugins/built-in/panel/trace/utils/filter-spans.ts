// Copyright (c) 2019 Uber Technologies, Inc.
//

import { concat } from 'lodash'
import {
  KeyValuePair,
  TraceSpan,
} from 'src/views/dashboard/plugins/built-in/panel/trace/types/trace'
import { isEmpty } from 'utils/validate'
import { TNil } from '../types/misc'

export default function filterSpans(
  textFilter: string,
  spans: TraceSpan[] | TNil,
) {
  if (!spans) {
    return null
  }

  // if a span field includes at least one filter in includeFilters, the span is a match
  const includeFilters: string[] = []

  // values with keys that include text in any one of the excludeKeys will be ignored
  const excludeKeys: string[] = []

  // split textFilter by whitespace, remove empty strings, and extract includeFilters and excludeKeys
  textFilter
    .split(/\s+/)
    .filter(Boolean)
    .forEach((w) => {
      if (w[0] === '-') {
        excludeKeys.push(w.substr(1).toLowerCase())
      } else {
        includeFilters.push(w.toLowerCase())
      }
    })

  const isTextInFilters = (filters: Array<string>, text: string) =>
    filters.some((filter) => text.toLowerCase().includes(filter))

  const isTextInKeyValues = (kvs: Array<KeyValuePair>) =>
    kvs
      ? kvs.some((kv) => {
          // ignore checking key and value for a match if key is in excludeKeys
          if (isTextInFilters(excludeKeys, kv.key)) return false
          // match if key, value or key=value string matches an item in includeFilters
          return (
            isTextInFilters(includeFilters, kv.key) ||
            isTextInFilters(includeFilters, kv.value.toString()) ||
            isTextInFilters(includeFilters, `${kv.key}=${kv.value.toString()}`)
          )
        })
      : false

  const isSpanAMatch = (span: TraceSpan) =>
    isTextInFilters(includeFilters, span.operationName) ||
    isTextInFilters(includeFilters, span.process.serviceName) ||
    isTextInKeyValues(concat(span.tags, span.attributes, span.resources)) ||
    (isEmpty(span.logs) ? span.events : span.logs !== null && span.logs).some(
      (log) => isTextInKeyValues(log.fields),
    ) ||
    isTextInKeyValues(span.process.tags) ||
    includeFilters.some(
      (filter) => filter.replace(/^0*/, '') === span.spanID.replace(/^0*/, ''),
    )

  // declare as const because need to disambiguate the type
  const rv: Set<string> = new Set(
    spans.filter(isSpanAMatch).map((span: TraceSpan) => span.spanID),
  )
  return rv
}
