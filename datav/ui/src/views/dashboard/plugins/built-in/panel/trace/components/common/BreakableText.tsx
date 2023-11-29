// Copyright (c) 2017 Uber Technologies, Inc.
//

import * as React from 'react'

const WORD_RX = /\W*\w+\W*/g

type Props = {
  text: string
  className?: string
  wordRegexp?: RegExp
  style?: Object
}

// TODO typescript doesn't understand text or null as react nodes
// https://github.com/Microsoft/TypeScript/issues/21699
export default function BreakableText(
  props: Props,
): any /* React.ReactNode /* React.ReactElement | React.ReactElement[] \*\/ */ {
  const { className, text, wordRegexp = WORD_RX, style } = props
  if (!text) {
    return typeof text === 'string' ? text : null
  }
  const spans = []
  wordRegexp.exec('')
  // if the given text has no words, set the first match to the entire text
  let match: RegExpExecArray | string[] | null = wordRegexp.exec(text) || [text]
  while (match) {
    spans.push(
      <span
        key={`${text}-${spans.length}`}
        className={className}
        style={{ display: 'inline-block', whiteSpace: 'pre', ...style }}
      >
        {match[0]}
      </span>,
    )
    match = wordRegexp.exec(text)
  }
  return spans
}

BreakableText.defaultProps = {
  className: 'BreakableText',
  wordRegexp: WORD_RX,
}
