// Copyright (c) 2017 Uber Technologies, Inc.
//

import { SpanLog } from 'src/views/dashboard/plugins/built-in/panel/trace/types/trace'

/**
 * Which items of a {@link SpanDetail} component are expanded.
 */
export default class DetailState {
  isTagsOpen: boolean
  isProcessOpen: boolean
  logs: { isOpen: boolean; openedItems: Set<SpanLog> }
  isWarningsOpen: boolean
  isReferencesOpen: boolean

  constructor(oldState?: DetailState) {
    const {
      isTagsOpen,
      isProcessOpen,
      isReferencesOpen,
      isWarningsOpen,
      logs,
    }: DetailState | Record<string, undefined> = oldState || {}
    this.isTagsOpen = true // Boolean(isTagsOpen);
    this.isProcessOpen = Boolean(isProcessOpen)
    this.isReferencesOpen = Boolean(isReferencesOpen)
    this.isWarningsOpen = Boolean(isWarningsOpen)
    this.logs = {
      isOpen: Boolean(logs && logs.isOpen),
      openedItems:
        logs && logs.openedItems ? new Set(logs.openedItems) : new Set(),
    }
  }

  toggleTags() {
    const next = new DetailState(this)
    next.isTagsOpen = !this.isTagsOpen
    return next
  }

  toggleProcess() {
    const next = new DetailState(this)
    next.isProcessOpen = !this.isProcessOpen
    return next
  }

  toggleReferences() {
    const next = new DetailState(this)
    next.isReferencesOpen = !this.isReferencesOpen
    return next
  }

  toggleWarnings() {
    const next = new DetailState(this)
    next.isWarningsOpen = !this.isWarningsOpen
    return next
  }

  toggleLogs() {
    const next = new DetailState(this)
    next.logs.isOpen = !this.logs.isOpen
    return next
  }

  toggleLogItem(logItem: SpanLog) {
    const next = new DetailState(this)
    if (next.logs.openedItems.has(logItem)) {
      next.logs.openedItems.delete(logItem)
    } else {
      next.logs.openedItems.add(logItem)
    }
    return next
  }
}
