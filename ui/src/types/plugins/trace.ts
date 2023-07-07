export type KeyValuePair = {
    key: string;
    value: any;
  };
  
  export type SpanLink = {
    url: string;
    text: string;
  };
  
  export type SpanLog = {
    timestamp: number;
    fields: Array<KeyValuePair>;
  };
  
  export type TraceProcess = {
    serviceName: string;
    tags: Array<KeyValuePair>;
  };
  
  export type SpanReference = {
    refType: 'CHILD_OF' | 'FOLLOWS_FROM';
    // eslint-disable-next-line no-use-before-define
    span: TraceSpan | null | undefined;
    spanID: string;
    traceID: string;
  };
  
  export type SpanData = {
    spanID: string;
    traceID: string;
    processID: string;
    operationName: string;
    startTime: number;
    duration: number;
    logs: Array<SpanLog>;
    tags?: Array<KeyValuePair>;
    references?: Array<SpanReference>;
    warnings?: Array<string> | null;
  };
  
  export type TraceSpan = SpanData & {
    depth: number;
    hasChildren: boolean;
    process: TraceProcess;
    relativeStartTime: number;
    tags: NonNullable<SpanData['tags']>;
    references: NonNullable<SpanData['references']>;
    warnings: NonNullable<SpanData['warnings']>;
    subsidiarilyReferencedBy: Array<SpanReference>;
  };
  
  export type TraceData = {
    processes: Record<string, TraceProcess>;
    traceID: string;
  };
  
  export type Trace = TraceData & {
    duration: number;
    endTime: number;
    spans: TraceSpan[];
    startTime: number;
    traceName: string;
    services: { name: string; numberOfSpans: number }[];
  };
  