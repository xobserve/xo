// Copyright (c) 2017 Uber Technologies, Inc.
//

import React from 'react'
import { shallow } from 'enzyme'
import sinon from 'sinon'

import Scrubber from './Scrubber'

describe('<Scrubber>', () => {
  const defaultProps = {
    onMouseDown: sinon.spy(),
    position: 0,
  }

  let wrapper

  beforeEach(() => {
    wrapper = shallow(<Scrubber {...defaultProps} />)
  })

  it('contains the proper svg components', () => {
    expect(
      wrapper.matchesElement(
        <g>
          <g className='Scrubber--handles'>
            <rect className='Scrubber--handleExpansion' />
            <rect className='Scrubber--handle' />
          </g>
          <line className='Scrubber--line' />
        </g>,
      ),
    ).toBeTruthy()
  })

  it('calculates the correct x% for a timestamp', () => {
    wrapper = shallow(<Scrubber {...defaultProps} position={0.5} />)
    const line = wrapper.find('line').first()
    const rect = wrapper.find('rect').first()
    expect(line.prop('x1')).toBe('50%')
    expect(line.prop('x2')).toBe('50%')
    expect(rect.prop('x')).toBe('50%')
  })

  it('supports onMouseDown', () => {
    const event = {}
    wrapper.find('.Scrubber--handles').prop('onMouseDown')(event)
    expect(defaultProps.onMouseDown.calledWith(event)).toBeTruthy()
  })
})
