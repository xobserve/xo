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

import { Box } from '@chakra-ui/react';
import * as React from 'react';
import './TimelineRow.css';

type TTimelineRowProps = {
  children: React.ReactNode;
  className?: string;
};

interface ITimelineRowCellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  width: number;
  style?: Object;
}

export default function TimelineRow(props: TTimelineRowProps) {
  const { children, className = '', ...rest } = props;
  return (
    <div className={`${className}`} style={{
            display: 'flex',
            flex: '0 1 auto',
            flexDirection: 'row'
    }} {...rest}>
      {children}
    </div>
  );
}

TimelineRow.defaultProps = {
  className: '',
};

function TimelineRowCell(props: ITimelineRowCellProps) {
  const { children, className = '', width, style, ...rest } = props;
  const widthPercent = `${width * 100}%`;
  const mergedStyle = { ...style, flexBasis: widthPercent, maxWidth: widthPercent };
  return (
    <Box position="relative" className={`${className}`} style={mergedStyle} {...rest} fontSize="0.9rem">
      {children}
    </Box>
  );
}

TimelineRowCell.defaultProps = { className: '', style: {} };

TimelineRow.Cell = TimelineRowCell;
