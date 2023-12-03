// Copyright (c) 2017 Uber Technologies, Inc.
//

import getLayout from './getLayout'
import { EWorkerErrorType } from './types'
// TODO: Use WorkerGlobalScope instead of Worker
// eslint-disable-next-line no-restricted-globals
const ctx = self
let currentMeta
function handleMessage(event) {
  const { edges, meta, options, vertices } = event.data
  currentMeta = meta
  const { layoutError, ...result } = getLayout(
    meta.phase,
    edges,
    vertices,
    options,
  )
  const type = layoutError ? EWorkerErrorType.LayoutError : meta.phase
  const message = {
    meta,
    type,
    ...result,
  }
  ctx.postMessage(message)
  currentMeta = null
}
function errorMessageFromEvent(errorType, event) {
  if (event instanceof ErrorEvent) {
    const { colno, error, filename, lineno, message } = event
    return {
      colno,
      error,
      errorType,
      filename,
      lineno,
      message,
    }
  }
  return {
    message: event.data,
  }
}
function handleError(errorType, event) {
  const payload = {
    type: EWorkerErrorType.Error,
    meta: currentMeta,
    errorMessage: errorMessageFromEvent(errorType, event),
  }
  ctx.postMessage(payload)
}
ctx.onmessage = handleMessage
ctx.onerror = handleError.bind(null, 'error')
ctx.onmessageerror = handleError.bind(ctx, 'messageerror')
