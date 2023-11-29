// Copyright (c) 2017 Uber Technologies, Inc.
//

import * as React from 'react'
import { jsonMarkup } from './jsonMarkup'
import './KeyValuesTable.css'

import { TNil } from 'types/misc'
import {
  KeyValuePair,
  SpanLink,
} from 'src/views/dashboard/plugins/built-in/panel/trace/types/trace'

import CopyToClipboard from 'src/components/CopyToClipboard'
import { FaLink } from 'react-icons/fa'
import { Box, useColorModeValue } from '@chakra-ui/react'
import customColors from 'src/theme/colors'

const jsonObjectOrArrayStartRegex = /^(\[|\{)/

function tryParseJson(value: string) {
  // if the value is a string representing actual json object or array, then use json-markup
  // otherwise just return as is
  try {
    return jsonObjectOrArrayStartRegex.test(value) ? JSON.parse(value) : value
  } catch (_) {
    return value
  }
}

function shouldDisplayAsStringList(key: string) {
  return (
    key.startsWith('http.request.header.') ||
    key.startsWith('http.response.header.')
  )
}

const stringListMarkup = (value: any[]) => (
  <div className='json-markup'>
    {value.map((item, i) => (
      <>
        {i > 0 && ', '}
        <span className='json-markup-string'>{item}</span>
      </>
    ))}
  </div>
)

const stringMarkup = (value: string) => (
  <div className='json-markup'>
    <span className='json-markup-string'>{value}</span>
  </div>
)

function _jsonMarkup(value: any) {
  const markup = { __html: jsonMarkup(value) }

  return (
    // eslint-disable-next-line react/no-danger
    <div dangerouslySetInnerHTML={markup} />
  )
}

function formatValue(key: string, value: any) {
  let content
  let parsed = value

  if (typeof value === 'string') {
    parsed = tryParseJson(value)
  }

  if (typeof parsed === 'string') {
    content = stringMarkup(parsed)
  } else if (Array.isArray(parsed) && shouldDisplayAsStringList(key)) {
    content = stringListMarkup(parsed)
  } else {
    content = _jsonMarkup(parsed)
  }

  return (
    <div style={{ display: 'inline-block' }} className='ub-inline-block'>
      {content}
    </div>
  )
}

export const LinkValue = (props: {
  href: string
  title?: string
  children: React.ReactNode
}) => (
  <a
    href={props.href}
    title={props.title}
    target='_blank'
    rel='noopener noreferrer'
  >
    {props.children} <FaLink className='KeyValueTable--linkIcon' />
  </a>
)

LinkValue.defaultProps = {
  title: '',
}

// const linkValueList = (links: SpanLink[]) => (
//   <Menu>
//     {links.map(({ text, url }, index) => (
//       // `index` is necessary in the key because url can repeat
//       // eslint-disable-next-line react/no-array-index-key
//       <Menu.Item key={`${url}-${index}`}>
//         <LinkValue href={url}>{text}</LinkValue>
//       </Menu.Item>
//     ))}
//   </Menu>
// );

type KeyValuesTableProps = {
  data: KeyValuePair[]
  linksGetter: ((pairs: KeyValuePair[], index: number) => SpanLink[]) | TNil
}

export default function KeyValuesTable(props: KeyValuesTableProps) {
  const { data, linksGetter } = props
  return (
    <Box
      className='KeyValueTable u-simple-scrollbars bordered'
      sx={{
        '.KeyValueTable--row:nth-child(2n) > td': {
          background: useColorModeValue('#f5f5f5', customColors.hoverBg.dark),
        },
      }}
    >
      <table className='u-width-100' style={{ width: '100%' }}>
        <tbody className='KeyValueTable--body'>
          {data.map((row, i) => {
            const jsonTable = formatValue(row.key, row.value)
            const links = linksGetter ? linksGetter(data, i) : null
            let valueMarkup
            if (links && links.length === 1) {
              valueMarkup = (
                <div>
                  <LinkValue href={links[0].url} title={links[0].text}>
                    {jsonTable}
                  </LinkValue>
                </div>
              )
            } else if (links && links.length > 1) {
              valueMarkup = (
                <div>
                  links todo
                  {/* <Dropdown overlay={linkValueList(links)} placement="bottomRight" trigger={['click']}>
                    <a>
                      {jsonTable} <Icon className="KeyValueTable--linkIcon" type="profile" />
                    </a>
                  </Dropdown> */}
                </div>
              )
            } else {
              valueMarkup = jsonTable
            }
            return (
              // `i` is necessary in the key because row.key can repeat
              // eslint-disable-next-line react/no-array-index-key
              <tr className='KeyValueTable--row' key={`${row.key}-${i}`}>
                <td
                  className='KeyValueTable--keyColumn'
                  style={{ padding: '6px 8px', fontSize: '0.9rem' }}
                >
                  {row.key}
                </td>
                <td style={{ padding: '6px 8px' }}>{valueMarkup}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Box>
  )
}
