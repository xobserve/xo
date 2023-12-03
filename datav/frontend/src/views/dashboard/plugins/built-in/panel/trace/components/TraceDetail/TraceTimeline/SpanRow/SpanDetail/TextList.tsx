// Copyright (c) 2019 Uber Technologies, Inc.
//

import * as React from 'react'
import './TextList.css'

type TextListProps = {
  data: string[]
}

export default function TextList(props: TextListProps) {
  const { data } = props
  return (
    <div className='TextList u-simple-scrollbars'>
      <ul className='TextList--List '>
        {data.map((row, i) => {
          return (
            // `i` is necessary in the key because row.key can repeat
            // eslint-disable-next-line react/no-array-index-key
            <li key={`${i}`}>{row}</li>
          )
        })}
      </ul>
    </div>
  )
}
