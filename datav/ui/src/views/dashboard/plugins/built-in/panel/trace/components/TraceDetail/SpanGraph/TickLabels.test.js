// Copyright (c) 2017 Uber Technologies, Inc.
//

import React from 'react'
import { shallow } from 'enzyme'

import TickLabels from './TickLabels'

describe('<TickLabels>', () => {
  const defaultProps = {
    numTicks: 4,
    duration: 5000,
  }

  let wrapper
  let ticks

  beforeEach(() => {
    wrapper = shallow(<TickLabels {...defaultProps} />)
    ticks = wrapper.find('[data-test="tick"]')
  })

  it('renders the right number of ticks', () => {
    expect(ticks.length).toBe(defaultProps.numTicks + 1)
  })

  it('places the first tick on the left', () => {
    const firstTick = ticks.first()
    expect(firstTick.prop('style')).toEqual({ left: '0%' })
  })

  it('places the last tick on the right', () => {
    const lastTick = ticks.last()
    expect(lastTick.prop('style')).toEqual({ right: '0%' })
  })

  it('places middle ticks at proper intervals', () => {
    const positions = ['25%', '50%', '75%']
    positions.forEach((pos, i) => {
      const tick = ticks.at(i + 1)
      expect(tick.prop('style')).toEqual({ left: pos })
    })
  })

  it("doesn't explode if no trace is present", () => {
    expect(() =>
      shallow(<TickLabels {...defaultProps} trace={null} />),
    ).not.toThrow()
  })
})
