// Copyright (c) 2018 Uber Technologies, Inc.
//

const SCALE_THRESHOLD_SMALL = 0.29
export default function classNameIsSmall(graphState) {
  const { k = 1 } = graphState.zoomTransform || {}
  if (k <= SCALE_THRESHOLD_SMALL) {
    return {
      className: 'is-small',
    }
  }
  return null
}
