// Copyright (c) 2017 Uber Technologies, Inc.
//

import React from 'react'
import { shallow } from 'enzyme'

import GraphTicks from './GraphTicks'

describe('<GraphTicks>', () => {
  const defaultProps = {
    items: [
      { valueWidth: 100, valueOffset: 25, serviceName: 'a' },
      { valueWidth: 100, valueOffset: 50, serviceName: 'b' },
    ],
    valueWidth: 200,
    numTicks: 4,
  }

  let ticksG

  beforeEach(() => {
    const wrapper = shallow(<GraphTicks {...defaultProps} />)
    ticksG = wrapper.find('[data-test="ticks"]')
  })

  it('creates a <g> for ticks', () => {
    expect(ticksG.length).toBe(1)
  })

  it('creates a line for each ticks excluding the first and last', () => {
    expect(ticksG.find('line').length).toBe(defaultProps.numTicks - 1)
  })
})
