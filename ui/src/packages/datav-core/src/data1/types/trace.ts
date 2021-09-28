/**
 * Type representing a tag in a trace span or fields of a log.
 */
export type TraceKeyValuePair<T = any> = {
  key: string;
  value: T;
};

/**
 * Type representing a log in a span.
 */
export type TraceLog = {
  // Millisecond epoch time
  timestamp: number;
  fields: TraceKeyValuePair[];
};

/**
 * This describes the structure of the dataframe that should be returned from a tracing data source to show trace
 * in a TraceView component.
 */
export interface TraceSpanRow {
  traceID: string;
  spanID: string;
  parentSpanID: string | undefined;
  operationName: string;
  serviceName: string;
  serviceTags: TraceKeyValuePair[];
  // Millisecond epoch time
  startTime: number;
  // Milliseconds
  duration: number;
  logs?: TraceLog[];

  // Note: To mark spen as having error add tag error: true
  tags?: TraceKeyValuePair[];
  warnings?: string[];
  stackTraces?: string[];

  // Specify custom color of the error icon
  errorIconColor?: string;
}

export type TraceLink = {
  url: string;
  text: string;
};



export type TraceProcess = {
  serviceName: string;
  tags: TraceKeyValuePair[];
};

export type TraceSpanReference = {
  refType: 'CHILD_OF' | 'FOLLOWS_FROM';
  // eslint-disable-next-line no-use-before-define
  span?: TraceSpan | null | undefined;
  spanID: string;
  traceID: string;
};

export type TraceSpanData = {
  spanID: string;
  traceID: string;
  processID: string;
  operationName: string;
  startTime: number;
  duration: number;
  logs: TraceLog[];
  tags?: TraceKeyValuePair[];
  references?: TraceSpanReference[];
  warnings?: string[] | null;
  stackTraces?: string[];
  flags: number;
  errorIconColor?: string;
};

export type TraceSpan = TraceSpanData & {
  depth: number;
  hasChildren: boolean;
  process: TraceProcess;
  relativeStartTime: number;
  tags: NonNullable<TraceSpanData['tags']>;
  references: NonNullable<TraceSpanData['references']>;
  warnings: NonNullable<TraceSpanData['warnings']>;
  subsidiarilyReferencedBy: TraceSpanReference[];
};

export type TraceData = {
  processes: Record<string, TraceProcess>;
  traceID: string;
  warnings?: string[] | null;
};

export type Trace = TraceData & {
  duration: number;
  endTime: number;
  spans: TraceSpan[];
  startTime: number;
  traceName: string;
  services: Array<{ name: string; numberOfSpans: number }>;
};