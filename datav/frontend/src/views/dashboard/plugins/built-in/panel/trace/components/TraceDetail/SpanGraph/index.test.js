// Copyright (c) 2017 Uber Technologies, Inc.
//

import React from 'react'
import { shallow } from 'enzyme'

import CanvasSpanGraph from './CanvasSpanGraph'
import SpanGraph from './index'
import TickLabels from './TickLabels'
import ViewingLayer from './ViewingLayer'
import traceGenerator from '../../../../demo/trace-generators'
import transformTraceData from '../../../../model/transform-trace-data'
import { polyfill as polyfillAnimationFrame } from '../../../../utils/test/requestAnimationFrame'

describe('<SpanGraph>', () => {
  polyfillAnimationFrame(window)

  const trace = transformTraceData(traceGenerator.trace({}))
  const props = {
    trace,
    updateViewRangeTime: () => {},
    viewRange: {
      time: {
        current: [0, 1],
      },
    },
  }

  let wrapper

  beforeEach(() => {
    wrapper = shallow(<SpanGraph {...props} />)
  })

  it('renders a <CanvasSpanGraph />', () => {
    expect(wrapper.find(CanvasSpanGraph).length).toBe(1)
  })

  it('renders a <TickLabels />', () => {
    expect(wrapper.find(TickLabels).length).toBe(1)
  })

  it('returns a <div> if a trace is not provided', () => {
    wrapper = shallow(<SpanGraph {...props} trace={null} />)
    expect(wrapper.matchesElement(<div />)).toBeTruthy()
  })

  it('passes the number of ticks to render to components', () => {
    const tickHeader = wrapper.find(TickLabels)
    const viewingLayer = wrapper.find(ViewingLayer)
    expect(tickHeader.prop('numTicks')).toBeGreaterThan(1)
    expect(viewingLayer.prop('numTicks')).toBeGreaterThan(1)
    expect(tickHeader.prop('numTicks')).toBe(viewingLayer.prop('numTicks'))
  })

  it('passes items to CanvasSpanGraph', () => {
    const canvasGraph = wrapper.find(CanvasSpanGraph).first()
    const items = trace.spans.map((span) => ({
      valueOffset: span.relativeStartTime,
      valueWidth: span.duration,
      serviceName: span.process.serviceName,
    }))
    expect(canvasGraph.prop('items')).toEqual(items)
  })

  it('does not regenerate CanvasSpanGraph without new trace', () => {
    const canvasGraph = wrapper.find(CanvasSpanGraph).first()
    const items = canvasGraph.prop('items')

    wrapper.instance().forceUpdate()

    const newCanvasGraph = wrapper.find(CanvasSpanGraph).first()
    const newItems = newCanvasGraph.prop('items')

    expect(newItems).toBe(items)
  })
})
