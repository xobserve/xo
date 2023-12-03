// Copyright (c) 2020 The Jaeger Authors.
//

import { Button } from '@chakra-ui/react'
import React from 'react'
import './PopupSql.css'

type Props = {
  closePopup: (popupContent: string) => void
  popupContent: string
}

/**
 * Render the popup that is needed for sql.
 */
export default function PopupSql(props: Props) {
  const value = `"${props.popupContent}"`
  return (
    <div className='PopupSQL'>
      <div className='PopupSQL--inner'>
        <h3 className='PopupSQL--header'>{'Tag: "SQL" '} </h3>
        <textarea readOnly className='PopupSQL--sqlContent' value={value} />
        <Button
          className='PopupSQL--closeButton'
          onClick={() => props.closePopup('')}
        >
          close{' '}
        </Button>
      </div>
    </div>
  )
}
