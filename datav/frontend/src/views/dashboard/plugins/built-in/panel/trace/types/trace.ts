// Copyright 2023 xObserve.io Team

export type KeyValuePair = {
  key: string
  value: any
}

export type SpanLink = {
  url: string
  text: string
}

export type SpanLog = {
  timestamp: number
  fields: Array<KeyValuePair>
}

export type TraceProcess = {
  serviceName: string
  tags: Array<KeyValuePair>
}

export type SpanReference = {
  refType: 'CHILD_OF' | 'FOLLOWS_FROM'
  // eslint-disable-next-line no-use-before-define
  span: TraceSpan | null | undefined
  spanID: string
  traceID: string
}

export type SpanData = {
  traceID: string
  spanID: string
  spanId?: string
  traceId?: string
  parentId: string
  events: SpanLog[]
  processID: string
  name?: string
  operationName: string
  serviceName?: string
  startTime: number
  duration: number
  hasError?: boolean
  statusCode?: number
  logs: Array<SpanLog>
  tags?: Array<KeyValuePair>
  resources?: Array<KeyValuePair>
  attributes?: Array<KeyValuePair>
  references?: Array<SpanReference>
  warnings?: Array<string> | null
  resourcesMap?: Record<string, string>
  stringAttributesMap?: Record<string, string>
  numberAttributesMap?: Record<string, number>
  boolAttributesMap?: Record<string, boolean>
}

export type TraceSpan = SpanData & {
  depth: number
  hasChildren: boolean
  process: TraceProcess
  relativeStartTime: number
  tags: NonNullable<SpanData['tags']>
  references: NonNullable<SpanData['references']>
  warnings: NonNullable<SpanData['warnings']>
  subsidiarilyReferencedBy: Array<SpanReference>
  children?: TraceSpan[]
}

export type TraceData = {
  processes: Record<string, TraceProcess>
  traceID: string
}

export type Trace = TraceData & {
  startTime: number
  endTime: number
  duration: number

  spans: TraceSpan[]
  serviceName: string
  traceName: string
  services: { name: string; numberOfSpans: number }[]
  errorsCount?: number
  errorServices?: Set<string>
}
