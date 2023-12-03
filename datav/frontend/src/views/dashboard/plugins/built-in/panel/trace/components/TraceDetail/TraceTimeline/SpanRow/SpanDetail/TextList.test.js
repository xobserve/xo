// Copyright (c) 2019 Uber Technologies, Inc.
//

import React from 'react'
import { shallow } from 'enzyme'
import TextList from './TextList'

describe('<TextList>', () => {
  let wrapper

  const data = [
    { key: 'span.kind', value: 'client' },
    { key: 'omg', value: 'mos-def' },
  ]

  beforeEach(() => {
    wrapper = shallow(<TextList data={data} />)
  })

  it('renders without exploding', () => {
    expect(wrapper).toBeDefined()
    expect(wrapper.find('.TextList').length).toBe(1)
  })

  it('renders a table row for each data element', () => {
    const trs = wrapper.find('li')
    expect(trs.length).toBe(data.length)
  })
})
