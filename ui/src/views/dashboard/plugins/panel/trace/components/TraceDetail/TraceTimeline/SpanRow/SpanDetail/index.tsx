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

import React from 'react';
import './index.css'
import AccordianKeyValues from './AccordianKeyValues';
import AccordianLogs from './AccordianLogs';
import AccordianReferences from './AccordianReferences';
import AccordianText from './AccordianText';
import DetailState from './DetailState';

import { TNil } from 'types/misc';
import { KeyValuePair, SpanLink, SpanLog, TraceSpan } from 'types/plugins/trace';

import { formatDuration } from 'utils/date';
import { Box, Divider, Flex, HStack, Text } from '@chakra-ui/react';
import LabeledList from 'src/components/LabelList';

type SpanDetailProps = {
  detailState: DetailState;
  linksGetter: ((links: KeyValuePair[], index: number) => SpanLink[]) | TNil;
  logItemToggle: (spanID: string, log: SpanLog) => void;
  logsToggle: (spanID: string) => void;
  processToggle: (spanID: string) => void;
  span: TraceSpan;
  tagsToggle: (spanID: string) => void;
  traceStartTime: number;
  warningsToggle: (spanID: string) => void;
  referencesToggle: (spanID: string) => void;
  focusSpan: (uiFind: string) => void;
};

export default function SpanDetail(props: SpanDetailProps) {
  const {
    detailState,
    linksGetter,
    logItemToggle,
    logsToggle,
    processToggle,
    span,
    tagsToggle,
    traceStartTime,
    warningsToggle,
    referencesToggle,
    focusSpan,
  } = props;
  const { isTagsOpen, isProcessOpen, logs: logsState, isWarningsOpen, isReferencesOpen } = detailState;
  const { operationName, process, duration, relativeStartTime, spanID, logs, tags, warnings, references } =
    span;
  const overviewItems = [
    {
      key: 'svc',
      label: 'Service:',
      value: process.serviceName,
    },
    {
      key: 'duration',
      label: 'Duration:',
      value: formatDuration(duration),
    },
    {
      key: 'start',
      label: 'Relative start time:',
      value: formatDuration(relativeStartTime),
    },
  ];
  const deepLinkCopyText = `${window.location.origin}${window.location.pathname}?uiFind=${spanID}`;

  return (
    <div>
      <Flex justifyContent="space-between" alignItems="center" pt="0" pb="2">
        <HStack>
          <Text textStyle="subTitle">{operationName}</Text>
          <Text opacity="0.7" mb="-2px">{spanID}</Text>
        </HStack>
        <LabeledList
          dividerClassName="SpanDetail--divider"
          items={overviewItems}
        />
      </Flex>
      <Divider className="SpanDetail--divider" />
      <Box mt="3">
        <div>
          <AccordianKeyValues
            data={tags}
            label="Tags"
            linksGetter={linksGetter}
            isOpen={isTagsOpen}
            onToggle={() => tagsToggle(spanID)}
          />
          {process.tags && (
            <AccordianKeyValues
              className="ub-mb1"
              data={process.tags}
              label="Process"
              linksGetter={linksGetter}
              isOpen={isProcessOpen}
              onToggle={() => processToggle(spanID)}
            />
          )}
        </div>
        {logs && logs.length > 0 && (
          <AccordianLogs
            linksGetter={linksGetter}
            logs={logs}
            isOpen={logsState.isOpen}
            openedItems={logsState.openedItems}
            onToggle={() => logsToggle(spanID)}
            onItemToggle={logItem => logItemToggle(spanID, logItem)}
            timestamp={traceStartTime}
          />
        )}
        {warnings && warnings.length > 0 && (
          <AccordianText
            className="AccordianWarnings"
            headerClassName="AccordianWarnings--header"
            label={<span className="AccordianWarnings--label">Warnings</span>}
            data={warnings}
            isOpen={isWarningsOpen}
            onToggle={() => warningsToggle(spanID)}
          />
        )}
        {references &&
          references.length > 0 &&
          (references.length > 1 || references[0].refType !== 'CHILD_OF') && (
            <AccordianReferences
              data={references}
              isOpen={isReferencesOpen}
              onToggle={() => referencesToggle(spanID)}
              focusSpan={focusSpan}
            />
          )}
        {/* <small className="SpanDetail--debugInfo">
          <span className="SpanDetail--debugLabel" data-label="SpanID:" /> {spanID}
          <CopyToClipboard
            copyText={deepLinkCopyText}
            placement="topRight"
            tooltipTitle="Copy deep link to this span"
          />
        </small> */}
      </Box>
    </div>
  );
}
