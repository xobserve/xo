//@ts-nocheck
// Copyright (c) 2019 Uber Technologies, Inc.
//

import * as React from 'react'

import { TSetOnContainer, TExposedGraphState } from './types'
import { assignMergeCss, getProps } from './utils'
import ZoomManager from '../zoom/ZoomManager'

type TProps<T = {}, U = {}> = Record<string, unknown> &
  TSetOnContainer<T, U> & {
    classNamePart: string
    getClassName: (name: string) => string
    graphState: TExposedGraphState<T, U>
    standalone?: boolean
    topLayer?: boolean
  }

const STYLE: React.CSSProperties = { left: 0, position: 'absolute', top: 0 }

export default class HtmlLayer<T = {}, U = {}> extends React.PureComponent<
  TProps<T, U>
> {
  render() {
    const {
      children,
      classNamePart,
      getClassName,
      graphState,
      setOnContainer,
      standalone,
      topLayer,
    } = this.props
    const { zoomTransform } = graphState
    const zoomStyle = {
      style:
        topLayer || standalone ? ZoomManager.getZoomStyle(zoomTransform) : {},
    }
    const containerProps = assignMergeCss(
      {
        className: getClassName(classNamePart),
        style: STYLE,
      },
      zoomStyle,
      getProps(setOnContainer, graphState),
    )
    return <div {...containerProps}>{children}</div>
  }
}
