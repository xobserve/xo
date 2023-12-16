// Copyright 2023 xobserve.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { useRef, useEffect, useState } from 'react'
import Markdown from 'markdown-to-jsx'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import { chakra, Flex, PropsOf } from '@chakra-ui/react'
import CustomScrollbar from 'components/CustomScrollbar/CustomScrollbar'

type Props = PropsOf<typeof chakra.div> & {
  md: string
  fontSize?: string
  fontWeight?: string
  scroll?: boolean
  enableToc?: boolean
}

const ChakraMarkdown = chakra(Markdown)

export function MarkdownRender({
  md,
  fontSize,
  fontWeight = '500',
  enableToc = false,
  ...rest
}: Props) {
  const rootRef = useRef<HTMLDivElement>()
  const [renderMd, setRenderMd] = useState(md)
  useEffect(() => {
    rootRef.current.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightBlock(block)
    })

    setRenderMd(md)
  }, [md])

  return (
    <Flex ref={rootRef} width='100%'>
      <CustomScrollbar hideHorizontalTrack>
        <ChakraMarkdown
          children={renderMd}
          {...rest}
          style={{
            height: '100%',
            fontSize: fontSize ?? '1.05rem',
            fontWeight: fontWeight,
            lineHeight: '1.4',
          }}
          className='markdown-render'
          options={{
            overrides: {},
            slugify: (str: string) =>
              str.replaceAll('`', '').toLowerCase().replace(/[?\s]/g, '-'),
          }}
          maxWidth='100%'
        ></ChakraMarkdown>
      </CustomScrollbar>
    </Flex>
  )
}
