// Copyright (c) 2018 Uber Technologies, Inc.
//

import queryString from 'query-string'

import prefixUrl from '../../../utils/prefix-url'

import { TNil } from 'types/misc'

export const ROUTE_PATH = prefixUrl('/trace/:id')

export function getUrl(id: string, uiFind?: string): string {
  const traceUrl = prefixUrl(`/trace/${id}`)
  if (!uiFind) return traceUrl

  return `${traceUrl}?${queryString.stringify({ uiFind })}`
}

export function getLocation(
  id: string,
  state: Record<string, any> | TNil,
  uiFind?: string,
) {
  return {
    state,
    pathname: getUrl(id),
    search: uiFind && queryString.stringify({ uiFind }),
  }
}
