// Copyright (c) 2017 Uber Technologies, Inc.
//
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

import getLayout from './getLayout';

import {
  EWorkerErrorType,
  TLayoutWorkerMeta,
  TWorkerInputMessage,
  TWorkerErrorMessage,
  TWorkerOutputMessage,
} from './types';

type TMessageErrorTarget = {
  onmessageerror: ((this: Worker, ev: ErrorEvent) => any | void) | null;
};

// TODO: Use WorkerGlobalScope instead of Worker
// eslint-disable-next-line no-restricted-globals
const ctx: Worker & TMessageErrorTarget = self as any;

let currentMeta: TLayoutWorkerMeta | null;

function handleMessage(event: MessageEvent) {
  const { edges, meta, options, vertices } = event.data as TWorkerInputMessage;
  currentMeta = meta;
  const { layoutError, ...result } = getLayout(meta.phase, edges, vertices, options);
  const type = layoutError ? EWorkerErrorType.LayoutError : meta.phase;
  const message: TWorkerOutputMessage = { meta, type, ...result };
  ctx.postMessage(message);
  currentMeta = null;
}

function errorMessageFromEvent(errorType: string, event: ErrorEvent | MessageEvent) {
  if (event instanceof ErrorEvent) {
    const { colno, error, filename, lineno, message } = event;

    return {
      colno,
      error,
      errorType,
      filename,
      lineno,
      message,
    };
  }

  return {
    message: event.data,
  };
}

function handleError(errorType: string, event: ErrorEvent | MessageEvent) {
  const payload: TWorkerErrorMessage = {
    type: EWorkerErrorType.Error,
    meta: currentMeta,
    errorMessage: errorMessageFromEvent(errorType, event),
  };
  ctx.postMessage(payload);
}

ctx.onmessage = handleMessage;
ctx.onerror = handleError.bind(null, 'error');
ctx.onmessageerror = handleError.bind(ctx, 'messageerror');
