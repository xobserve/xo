// Copyright 2023 xObserve.io Team

import { Help } from 'types/misc'

export const nodeGraphHelp: Help[] = [
  {
    title: 'Target selection',
    headers: ['Action', 'Effect'],
    contents: [
      ['Click on a node', 'Select the node'],
      ['Double click on a node', "Select the node and it's relational edges"],
      [
        'Press and hold down Shift, then click on some nodes',
        'Select several nodes',
      ],
      [
        'Press and hold down Shift, then press your mouse to swipe selecting a area',
        'Select all nodes and edges in a area',
      ],
    ],
  },
]
