import React, { useRef, useEffect, useState } from 'react';
import Markdown from 'markdown-to-jsx';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import {  chakra, Flex, PropsOf } from '@chakra-ui/react';


type Props = PropsOf<typeof chakra.div> & {
  md: string
  fontSize?: string
  fontWeight?: string
  scroll?: boolean
  enableToc?: boolean
}

const ChakraMarkdown = chakra(Markdown)

export function MarkdownRender({ md, fontSize,fontWeight="500",enableToc = false, ...rest }: Props) {
  const rootRef = useRef<HTMLDivElement>();
  const [renderMd, setRenderMd] = useState(md)
  useEffect(() => {
    rootRef.current.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightBlock(block);
    });

    setRenderMd(md)
  }, [md]);

  return (
    <Flex ref={rootRef}>
      <ChakraMarkdown
        children={renderMd}
        {...rest}
        style={{ height: '100%', fontSize: fontSize ?? '1.05rem', fontWeight: fontWeight, lineHeight: '1.7' }}
        className="markdown-render"
        options={{
          overrides: {
          },
          slugify: str => str.toLowerCase().replace(/[?\s]/g, "-")
        }}
        maxWidth="100%"
      ></ChakraMarkdown>
    </Flex>
  );
}
