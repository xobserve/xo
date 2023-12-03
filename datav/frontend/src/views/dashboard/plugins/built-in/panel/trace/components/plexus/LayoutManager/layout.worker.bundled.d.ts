// Copyright (c) 2019 Uber Technologies, Inc.
//

export default class LayoutkWorker extends Worker {
  id: number
  constructor()
  // `onmessageerror` is missing from the TypeScript type def for workers
  // https://html.spec.whatwg.org/multipage/workers.html#dedicated-workers-and-the-worker-interface
  onmessageerror: ((this: Worker, event: ErrorEvent) => any | void) | null
}
