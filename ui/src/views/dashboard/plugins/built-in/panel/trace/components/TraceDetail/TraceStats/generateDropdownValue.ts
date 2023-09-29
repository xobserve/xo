// Copyright (c) 2020 The Jaeger Authors.
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

import _ from 'lodash';
import { Trace } from 'src/views/dashboard/plugins/built-in/panel/trace/types/trace';
import { ITableSpan } from './types';

const serviceName = 'Service Name';
const operationName = 'Operation Name';

/**
 * Used to get the values if no tag is picked from the first dropdown.
 */
function getValueTagIsPicked(tableValue: ITableSpan[], trace: Trace, nameSelectorTitle: string) {
  const allSpans = trace.spans;
  let availableTags = [];

  // add all Spans with this tag key

  for (let i = 0; i < tableValue.length; i++) {
    if (tableValue[i].hasSubgroupValue) {
      for (let j = 0; j < allSpans.length; j++) {
        for (let l = 0; l < allSpans[j].tags.length; l++) {
          if (nameSelectorTitle === allSpans[j].tags[l].key) {
            availableTags.push(allSpans[j]);
          }
        }
      }
    }
  }
  availableTags = [...new Set(availableTags)];

  const tags = _(availableTags).map('tags').flatten().value();
  let tagKeys = _(tags).map('key').uniq().value();
  tagKeys = _.filter(tagKeys, function calc(o) {
    return o !== nameSelectorTitle;
  });
  availableTags = [];
  availableTags.push(serviceName);
  availableTags.push(operationName);
  availableTags = availableTags.concat(tagKeys);

  return availableTags;
}

/**
 * Used to get the values if no tag is picked from the first dropdown.
 */
function getValueNoTagIsPicked(trace: Trace, nameSelectorTitle: string) {
  let availableTags = [];
  const allSpans = trace.spans;
  if (nameSelectorTitle === serviceName) {
    availableTags.push(operationName);
  } else {
    availableTags.push(serviceName);
  }
  for (let i = 0; i < allSpans.length; i++) {
    for (let j = 0; j < allSpans[i].tags.length; j++) {
      availableTags.push(allSpans[i].tags[j].key);
    }
  }
  availableTags = [...new Set(availableTags)];

  return availableTags;
}

export function generateDropdownValue(trace: Trace) {
  const allSpans = trace.spans;
  const tags = _(allSpans).map('tags').flatten().value();
  const tagKeys = _(tags).map('key').uniq().value();
  const values = _.concat(serviceName, operationName, tagKeys);
  return values;
}

export function generateSecondDropdownValue(tableValue: ITableSpan[], trace: Trace, dropdownTitle1: string) {
  let values;
  if (dropdownTitle1 !== serviceName && dropdownTitle1 !== operationName) {
    values = getValueTagIsPicked(tableValue, trace, dropdownTitle1);
  } else {
    values = getValueNoTagIsPicked(trace, dropdownTitle1);
  }
  return values;
}
