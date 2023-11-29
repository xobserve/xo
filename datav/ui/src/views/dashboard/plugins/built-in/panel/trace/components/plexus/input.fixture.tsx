// Copyright (c) 2017 Uber Technologies, Inc.
//

import React from 'react'

const input = {
  vertices: [
    {
      key: 'string key 0',
      data: {
        value: new Date(),
        message: 'vertex w a string key that has spaces',
      },
    },
    {
      key: 1,
      label: 'Key is the number 1',
      data: {
        err: new Error('An error object'),
        message: 'vertex with a number key and a string label',
      },
    },
    {
      key: '2',
      label: <h3>OMG an H3</h3>,
      data: { message: 'label is an H3 React element' },
    },
    {
      key: 33,
      data: {
        value: /abc/,
        message: 'data contains a RegExp and the node lacks a label',
      },
    },
  ],
  edges: [
    {
      from: 'string key 0',
      to: 1,
      label: 'The Great TEdge Label',
      data: 'TEdge with a string label',
    },
    {
      from: 'string key 0',
      to: '2',
      label: <strong>Drop it like its hot</strong>,
      data: 'edge with a React.Node label',
    },
    { from: '1', to: '2', data: 'edge sans label' },
    { from: '2', to: 33, isBidirectional: true, data: 'A bidirection edge' },
  ],
}

export default input

export const sizedInput = {
  vertices: input.vertices.map((vertex) => ({
    vertex,
    height: 100,
    width: 300,
  })),
  edges: input.edges,
}
