// Copyright (c) 2017 Uber Technologies, Inc.
//

import Tween from './tween'

const DURATION_MS = 350

let lastTween: Tween | void

// TODO(joe): this util can be modified a bit to be generalized (e.g. take in
// an element as a parameter and use scrollTop instead of window.scrollTo)

function _onTweenUpdate({ done, value }: { done: boolean; value: number }) {
  window.scrollTo(window.scrollX, value)
  if (done) {
    lastTween = undefined
  }
}

export function scrollBy(yDelta: number, appendToLast: boolean = false) {
  const { scrollY } = window
  let targetFrom = scrollY
  if (appendToLast && lastTween) {
    const currentDirection = lastTween.to < scrollY ? 'up' : 'down'
    const nextDirection = yDelta < 0 ? 'up' : 'down'
    if (currentDirection === nextDirection) {
      targetFrom = lastTween.to
    }
  }
  const to = targetFrom + yDelta
  lastTween = new Tween({
    to,
    duration: DURATION_MS,
    from: scrollY,
    onUpdate: _onTweenUpdate,
  })
}

export function scrollTo(y: number) {
  const { scrollY } = window
  lastTween = new Tween({
    duration: DURATION_MS,
    from: scrollY,
    to: y,
    onUpdate: _onTweenUpdate,
  })
}

export function cancel() {
  if (lastTween) {
    lastTween.cancel()
    lastTween = undefined
  }
}
