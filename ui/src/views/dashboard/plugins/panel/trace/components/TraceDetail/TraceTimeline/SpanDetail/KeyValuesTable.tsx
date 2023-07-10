// Copyright (c) 2017 Uber Technologies, Inc.
//
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

import * as React from 'react';
import { Dropdown, Icon, Menu } from 'antd';
import { jsonMarkup } from './jsonMarkup';

import CopyIcon from '../../../common/CopyIcon';

import { TNil } from '../../../../types';
import { KeyValuePair, Link } from '../../../../types/trace';

import './KeyValuesTable.css';

const jsonObjectOrArrayStartRegex = /^(\[|\{)/;

function tryParseJson(value: string) {
  // if the value is a string representing actual json object or array, then use json-markup
  // otherwise just return as is
  try {
    return jsonObjectOrArrayStartRegex.test(value) ? JSON.parse(value) : value;
  } catch (_) {
    return value;
  }
}

function shouldDisplayAsStringList(key: string) {
  return key.startsWith('http.request.header.') || key.startsWith('http.response.header.');
}

const stringListMarkup = (value: any[]) => (
  <div className="json-markup">
    {value.map((item, i) => (
      <>
        {i > 0 && ', '}
        <span className="json-markup-string">{item}</span>
      </>
    ))}
  </div>
);

const stringMarkup = (value: string) => (
  <div className="json-markup">
    <span className="json-markup-string">{value}</span>
  </div>
);

function _jsonMarkup(value: any) {
  const markup = { __html: jsonMarkup(value) };

  return (
    // eslint-disable-next-line react/no-danger
    <div dangerouslySetInnerHTML={markup} />
  );
}

function formatValue(key: string, value: any) {
  let content;
  let parsed = value;

  if (typeof value === 'string') {
    parsed = tryParseJson(value);
  }

  if (typeof parsed === 'string') {
    content = stringMarkup(parsed);
  } else if (Array.isArray(parsed) && shouldDisplayAsStringList(key)) {
    content = stringListMarkup(parsed);
  } else {
    content = _jsonMarkup(parsed);
  }

  return <div className="ub-inline-block">{content}</div>;
}

export const LinkValue = (props: { href: string; title?: string; children: React.ReactNode }) => (
  <a href={props.href} title={props.title} target="_blank" rel="noopener noreferrer">
    {props.children} <Icon className="KeyValueTable--linkIcon" type="export" />
  </a>
);

LinkValue.defaultProps = {
  title: '',
};

const linkValueList = (links: Link[]) => (
  <Menu>
    {links.map(({ text, url }, index) => (
      // `index` is necessary in the key because url can repeat
      // eslint-disable-next-line react/no-array-index-key
      <Menu.Item key={`${url}-${index}`}>
        <LinkValue href={url}>{text}</LinkValue>
      </Menu.Item>
    ))}
  </Menu>
);

type KeyValuesTableProps = {
  data: KeyValuePair[];
  linksGetter: ((pairs: KeyValuePair[], index: number) => Link[]) | TNil;
};

export default function KeyValuesTable(props: KeyValuesTableProps) {
  const { data, linksGetter } = props;
  return (
    <div className="KeyValueTable u-simple-scrollbars">
      <table className="u-width-100">
        <tbody className="KeyValueTable--body">
          {data.map((row, i) => {
            const jsonTable = formatValue(row.key, row.value);
            const links = linksGetter ? linksGetter(data, i) : null;
            let valueMarkup;
            if (links && links.length === 1) {
              valueMarkup = (
                <div>
                  <LinkValue href={links[0].url} title={links[0].text}>
                    {jsonTable}
                  </LinkValue>
                </div>
              );
            } else if (links && links.length > 1) {
              valueMarkup = (
                <div>
                  <Dropdown overlay={linkValueList(links)} placement="bottomRight" trigger={['click']}>
                    <a>
                      {jsonTable} <Icon className="KeyValueTable--linkIcon" type="profile" />
                    </a>
                  </Dropdown>
                </div>
              );
            } else {
              valueMarkup = jsonTable;
            }
            return (
              // `i` is necessary in the key because row.key can repeat
              // eslint-disable-next-line react/no-array-index-key
              <tr className="KeyValueTable--row" key={`${row.key}-${i}`}>
                <td className="KeyValueTable--keyColumn">{row.key}</td>
                <td>{valueMarkup}</td>
                <td className="KeyValueTable--copyColumn">
                  <CopyIcon
                    className="KeyValueTable--copyIcon"
                    copyText={row.value}
                    tooltipTitle="Copy value"
                  />
                  <CopyIcon
                    className="KeyValueTable--copyIcon"
                    icon="snippets"
                    copyText={JSON.stringify(row, null, 2)}
                    tooltipTitle="Copy JSON"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
