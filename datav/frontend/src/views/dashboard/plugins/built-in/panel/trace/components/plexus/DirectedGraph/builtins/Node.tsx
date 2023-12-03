// Copyright (c) 2017 Uber Technologies, Inc.
//

import * as React from 'react'

type TProps = Record<string, any> & {
  classNamePrefix: string
  children?: React.ReactNode
  forwardedRef: any
  hidden?: boolean
  labelFactory: Function
  left?: number
  top?: number
  vertex: any
}

class Node extends React.PureComponent<TProps> {
  static defaultProps = {
    hidden: false,
    left: null,
    top: null,
  }

  render() {
    const {
      classNamePrefix,
      hidden,
      labelFactory,
      vertex,
      left,
      top,
      forwardedRef,
      ...rest
    } = this.props
    const p: Record<string, any> = rest
    p.style = {
      ...p.style,
      position: 'absolute',
      transform:
        left == null || top == null
          ? undefined
          : `translate(${left}px,${top}px)`,
      visibility: hidden ? 'hidden' : undefined,
    }
    p.className = `${classNamePrefix}-Node ${p.className || ''}`
    return (
      <div ref={forwardedRef} {...p}>
        {labelFactory(vertex)}
      </div>
    )
  }
}

// ghetto fabulous cast because the 16.3 API is not in flow yet
// https://github.com/facebook/flow/issues/6103
// eslint-disable-next-line react/no-multi-comp
export default React.forwardRef<{}, TProps>((props, ref) => (
  <Node {...props} forwardedRef={ref} />
))
