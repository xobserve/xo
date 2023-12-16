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

import { mode } from '@chakra-ui/theme-tools'

export default function markdownRender(props) {
  return {
    '.markdown-render': {
      wordBreak: 'break-word',
      img: {
        display: 'inline-block',
      },
      '.hljs': {
        padding: '1rem',
        borderRadius: '8px',
      },
      'ul,ol': {
        paddingLeft: '1rem',
        margin: '0rem 0',
        li: {
          margin: '.3rem 0',
        },
      },
      h1: {
        fontSize: '1.4em',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
      },
      h2: {
        fontSize: '1.3em',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
      },
      h3: {
        fontSize: '1.2em',
        fontWeight: '600',
        marginBottom: '0.3rem',
      },
      h4: {
        fontSize: '1.1em',
        fontWeight: '600',
      },
      h5: {
        fontSize: '1em',
        fontWeight: 'normal',
      },
      h6: {
        fontSize: '1em',
        fontWeight: 'normal',
      },
      p: {
        padding: '0rem 0',
      },
      blockquote: {
        lineHeight: '2rem',
        margin: '1.5rem 0',
        p: {
          paddingLeft: '1rem',
          fontWeight: '500',
          fontStyle: 'italic',
          borderLeftWidth: '.25rem',
          borderLeftColor: '#e5e7eb',
          color: mode('inherit', "'rgb(189, 189, 189)'")(props),
          fontSize: '1.2rem',
        },
      },
      pre: {
        margin: '1rem 0',
        fontSize: '.95rem',
      },
      a: {
        textDecoration: 'none',
        color: mode('twitter.500', 'twitter.500')(props),
      },
      'p code': {
        bg: mode('rgba(175, 184, 193, 0.2)', 'rgba(110, 118, 129, 0.3)')(props),
        borderRadius: '6px',
        padding: '3px 6px',
        wordBreak: 'break-all',
      },
      '.at-user-link': {
        textDecoration: 'none !important',
        borderBottom: '2px dashed rgb(158, 158, 158)',
        margin: '0 3px',
        color: mode(
          props.theme.colors.teal[600],
          props.theme.colors.teal[200],
        )(props),
        fontWeight: '550',
        paddingBottom: '2px',
      },
    },
  }
}
