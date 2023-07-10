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
import cx from 'classnames';
import _sortBy from 'lodash/sortBy';

import AccordianKeyValues from './AccordianKeyValues';
import { TNil } from 'types/misc';
import { SpanLog, KeyValuePair, SpanLink } from 'types/plugins/trace';

import { formatDuration } from '../../../../../utils/date';
import { AiOutlineArrowDown, AiOutlineArrowRight } from 'react-icons/ai';
import { Box } from '@chakra-ui/react';

type AccordianLogsProps = {
  interactive?: boolean;
  isOpen: boolean;
  linksGetter: ((pairs: KeyValuePair[], index: number) => SpanLink[]) | TNil;
  logs: SpanLog[];
  onItemToggle?: (log: SpanLog) => void;
  onToggle?: () => void;
  openedItems?: Set<SpanLog>;
  timestamp: number;
};

export default function AccordianLogs(props: AccordianLogsProps) {
  const { interactive, isOpen, linksGetter, logs, openedItems, onItemToggle, onToggle, timestamp } = props;
  let arrow: React.ReactNode | null = null;
  let HeaderComponent: 'span' | 'a' = 'span';
  let headerProps: Object | null = null;
  if (interactive) {
    arrow = isOpen ? (
      <AiOutlineArrowDown className="u-align-icon" />
    ) : (
      <AiOutlineArrowRight className="u-align-icon" />
    );
    HeaderComponent = 'a';
    headerProps = {
      'aria-checked': isOpen,
      onClick: onToggle,
      role: 'switch',
    };
  }

  return (
    <Box className="AccordianLogs"   sx={{
      '.AccordianLogs--header svg': {
        display: "inline-block !important",
        marginBottom: '-2px',
        marginRight: '5px'
      }
    }}>
      <HeaderComponent className={cx('AccordianLogs--header', { 'is-open': isOpen })} {...headerProps}>
        {arrow} <strong>Logs</strong> ({logs.length})
      </HeaderComponent>
      {isOpen && (
        <div className="AccordianLogs--content">
          {_sortBy(logs, 'timestamp').map((log, i) => (
            <AccordianKeyValues
              // `i` is necessary in the key because timestamps can repeat
              // eslint-disable-next-line react/no-array-index-key
              key={`${log.timestamp}-${i}`}
              className={i < logs.length - 1 ? 'ub-mb1' : null}
              data={log.fields || []}
              highContrast
              interactive={interactive}
              isOpen={openedItems ? openedItems.has(log) : false}
              label={`${formatDuration(log.timestamp - timestamp)}`}
              linksGetter={linksGetter}
              onToggle={interactive && onItemToggle ? () => onItemToggle(log) : null}
            />
          ))}
          <small className="AccordianLogs--footer">
            Log timestamps are relative to the start time of the full trace.
          </small>
        </div>
      )}
    </Box>
  );
}

AccordianLogs.defaultProps = {
  interactive: true,
  linksGetter: undefined,
  onItemToggle: undefined,
  onToggle: undefined,
  openedItems: undefined,
};
