// Copyright (c) 2017 Uber Technologies, Inc.
//

import React from 'react'

import { Divider, HStack } from '@chakra-ui/react'

type LabeledListProps = {
  className?: string
  dividerClassName?: string
  items: { key: string; label: React.ReactNode; value: React.ReactNode }[]
}

export default function LabeledList(props: LabeledListProps) {
  const { className, dividerClassName, items } = props
  return (
    <HStack
      spacing={1}
      className={`LabeledList ${className || ''}`}
      style={{ listStyle: 'none', margin: 0, padding: 0 }}
    >
      {items.map(({ key, label, value }, i) => {
        const divider = i < items.length - 1 && (
          <li
            className='LabeledList--item'
            key={`${key}--divider`}
            style={{ display: 'inline-block' }}
          >
            <Divider className={dividerClassName} orientation='vertical' />
          </li>
        )
        return [
          <li
            className='LabeledList--item'
            style={{ display: 'inline-block' }}
            key={key}
          >
            <span
              className='LabeledList--label'
              style={{ marginRight: '0.25rem', opacity: 0.8 }}
            >
              {label}
            </span>
            <strong>{value}</strong>
          </li>,
          divider,
        ]
      })}
    </HStack>
  )
}
