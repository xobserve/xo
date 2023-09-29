// Copyright 2023 Datav.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
    errorsCount?: number;
    errorServices?: Set<string>
  };
  