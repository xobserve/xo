// Copyright (c) 2017 Uber Technologies, Inc.
//

import React from 'react'
import { shallow } from 'enzyme'

import CanvasSpanGraph from './CanvasSpanGraph'

describe('<CanvasSpanGraph>', () => {
  it('renders without exploding', () => {
    const items = [
      { valueWidth: 1, valueOffset: 1, serviceName: 'service-name-0' },
    ]
    const wrapper = shallow(<CanvasSpanGraph items={[]} valueWidth={4000} />)
    expect(wrapper).toBeDefined()
    wrapper.instance()._setCanvasRef({
      getContext: () => ({
        fillRect: () => {},
      }),
    })
    wrapper.setProps({ items })
  })
})
