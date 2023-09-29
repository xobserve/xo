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

import * as _ from 'lodash';
import { Trace, TraceSpan } from 'src/views/dashboard/plugins/built-in/panel/trace/types/trace';
import { ITableSpan } from './types';
import colorGenerator from 'utils/colorGenerator';

const serviceName = 'Service Name';
const operationName = 'Operation Name';

/**
 * Return the lowest startTime.
 */
function getLowestStartTime(allOverlay: TraceSpan[]) {
  let result;
  const temp = _.minBy(allOverlay, function calc(a) {
    return a.relativeStartTime;
  });
  if (temp !== undefined) {
    result = { duration: temp.duration, lowestStartTime: temp.relativeStartTime };
  } else {
    result = { duration: -1, lowestStartTime: -1 };
  }
  return result;
}

/**
 * Determines whether the cut spans belong together and then calculates the duration.
 */
function getDuration(lowestStartTime: number, duration: number, allOverlay: TraceSpan[]) {
  let durationChange = duration;
  let didDelete = false;
  for (let i = 0; i < allOverlay.length; i++) {
    if (lowestStartTime + durationChange >= allOverlay[i].relativeStartTime) {
      if (lowestStartTime + durationChange < allOverlay[i].relativeStartTime + allOverlay[i].duration) {
        const tempDuration =
          allOverlay[i].relativeStartTime + allOverlay[i].duration - lowestStartTime + durationChange;
        durationChange = tempDuration;
      }
      allOverlay.splice(i, 1);
      didDelete = true;
      break;
    }
  }
  const result = { allOverlay, duration: durationChange, didDelete };
  return result;
}

/**
 * Return the selfTime of overlay spans.
 */
function onlyOverlay(allOverlay: TraceSpan[], allChildren: TraceSpan[], tempSelf: number, span: TraceSpan) {
  let tempSelfChange = tempSelf;
  let duration = 0;
  let resultGetDuration = { allOverlay, duration, didDelete: false };
  const noOverlay = _.difference(allChildren, allOverlay);
  let lowestStartTime = 0;
  let totalDuration = 0;
  const result = getLowestStartTime(allOverlay);
  lowestStartTime = result.lowestStartTime;
  duration = result.duration;

  do {
    resultGetDuration = getDuration(lowestStartTime, duration, resultGetDuration.allOverlay);
    if (!resultGetDuration.didDelete && resultGetDuration.allOverlay.length > 0) {
      totalDuration = resultGetDuration.duration;
      const temp = getLowestStartTime(resultGetDuration.allOverlay);
      lowestStartTime = temp.lowestStartTime;
      duration = temp.duration;
    }
  } while (resultGetDuration.allOverlay.length > 1);
  duration = resultGetDuration.duration + totalDuration;
  // no cut is observed
  for (let i = 0; i < noOverlay.length; i++) {
    duration += noOverlay[i].duration;
  }
  tempSelfChange += span.duration - duration;

  return tempSelfChange;
}

/**
 * Used to calculated the content.
 */
function calculateContent(trace: Trace, span: TraceSpan, allSpans: TraceSpan[], resultValue: any) {
  const resultValueChange = resultValue;
  resultValueChange.count += 1;
  resultValueChange.total += span.duration;
  if (resultValueChange.min > span.duration) {
    resultValueChange.min = span.duration;
  }
  if (resultValueChange.max < span.duration) {
    resultValueChange.max = span.duration;
  }
  // selfTime
  let tempSelf = 0;
  let longerAsParent = false;
  let kinderSchneiden = false;
  let allOverlay = [];
  const longerAsParentSpan = [];
  if (span.hasChildren) {
    const allChildren = [] as any;
    for (let i = 0; i < allSpans.length; i++) {
      // i am a child?
      if (allSpans[i].references.length === 1) {
        if (span.spanID === allSpans[i].references[0].spanID) {
          allChildren.push(allSpans[i]);
        }
      }
    }
    // i only have one child
    if (allChildren.length === 1) {
      if (
        span.relativeStartTime + span.duration >=
        allChildren[0].relativeStartTime + allChildren[0].duration
      ) {
        tempSelf = span.duration - allChildren[0].duration;
      } else {
        tempSelf = allChildren[0].relativeStartTime - span.relativeStartTime;
      }
    } else {
      // is the child longer as parent
      for (let i = 0; i < allChildren.length; i++) {
        if (
          span.duration + span.relativeStartTime <
          allChildren[i].duration + allChildren[i].relativeStartTime
        ) {
          longerAsParent = true;
          longerAsParentSpan.push(allChildren[i]);
        }
      }
      // Do the children overlap?
      for (let i = 0; i < allChildren.length; i++) {
        for (let j = 0; j < allChildren.length; j++) {
          // aren't they the same kids?
          if (allChildren[i].spanID !== allChildren[j].spanID) {
            // if yes the children cut themselves or lie into each other
            if (
              allChildren[i].relativeStartTime <= allChildren[j].relativeStartTime &&
              allChildren[i].relativeStartTime + allChildren[i].duration >= allChildren[j].relativeStartTime
            ) {
              kinderSchneiden = true;
              allOverlay.push(allChildren[i]);
              allOverlay.push(allChildren[j]);
            }
          }
        }
      }
      allOverlay = [...new Set(allOverlay)];
      // diff options
      if (!longerAsParent && !kinderSchneiden) {
        tempSelf = span.duration;
        for (let i = 0; i < allChildren.length; i++) {
          tempSelf -= allChildren[i].duration;
        }
      } else if (longerAsParent && kinderSchneiden) {
        // cut only longerAsParent
        if (_.isEmpty(_.xor(allOverlay, longerAsParentSpan))) {
          // find ealiesr longerasParent
          const earliestLongerAsParent = _.minBy(longerAsParentSpan, function calc(a) {
            return a.relativeStartTime;
          });
          // remove all children wo are longer as Parent
          const allChildrenWithout = _.difference(allChildren, longerAsParentSpan);
          tempSelf = earliestLongerAsParent.relativeStartTime - span.relativeStartTime;
          for (let i = 0; i < allChildrenWithout.length; i++) {
            tempSelf -= allChildrenWithout[i].duration;
          }
        } else {
          const overlayOnly = _.difference(allOverlay, longerAsParentSpan);
          const allChildrenWithout = _.difference(allChildren, longerAsParentSpan);
          const earliestLongerAsParent = _.minBy(longerAsParentSpan, function calc(a) {
            return a.relativeStartTime;
          });

          // overlay between longerAsParent and overlayOnly
          const overlayWithout = [];
          for (let i = 0; i < overlayOnly.length; i++) {
            if (!earliestLongerAsParent.relativeStartTime <= overlayOnly[i].relativeStartTime) {
              overlayWithout.push(overlayOnly[i]);
            }
          }
          for (let i = 0; i < overlayWithout.length; i++) {
            if (
              overlayWithout[i].relativeStartTime + overlayWithout[i].duration >
              earliestLongerAsParent.relativeStartTime
            ) {
              overlayWithout[i].duration -=
                overlayWithout[i].relativeStartTime +
                overlayWithout[i].duration -
                earliestLongerAsParent.relativeStartTime;
              if (overlayWithout[i].duration < 0) {
                overlayWithout[i].duration = 0;
              }
            }
          }

          tempSelf = onlyOverlay(overlayWithout, allChildrenWithout, tempSelf, span);
          const diff = span.relativeStartTime + span.duration - earliestLongerAsParent.relativeStartTime;
          tempSelf = Math.max(0, tempSelf - diff);
        }
      } else if (longerAsParent) {
        // span is longer as Parent
        tempSelf = longerAsParentSpan[0].relativeStartTime - span.relativeStartTime;
        for (let i = 0; i < allChildren.length; i++) {
          if (allChildren[i].spanID !== longerAsParentSpan[0].spanID) {
            tempSelf -= allChildren[i].duration;
          }
        }
      } else {
        // Overlay
        tempSelf = onlyOverlay(allOverlay, allChildren, tempSelf, span);
      }
    }
    // no children
  } else {
    tempSelf += span.duration;
  }
  if (resultValueChange.selfMin > tempSelf) {
    resultValueChange.selfMin = tempSelf;
  }
  if (resultValueChange.selfMax < tempSelf) {
    resultValueChange.selfMax = tempSelf;
  }
  resultValueChange.selfTotal += tempSelf;

  const onePercent = 100 / trace.duration;
  resultValueChange.percent = resultValueChange.selfTotal * onePercent;

  return resultValueChange;
}

/**
 * Builds an obeject which represents a column.
 */
function buildOneColumn(oneColumn: ITableSpan) {
  const oneColumnChange = oneColumn;
  oneColumnChange.total = Math.round((oneColumnChange.total / 1000) * 100) / 100;
  oneColumnChange.avg = Math.round((oneColumnChange.avg / 1000) * 100) / 100;
  oneColumnChange.min = Math.round((oneColumnChange.min / 1000) * 100) / 100;
  oneColumnChange.max = Math.round((oneColumnChange.max / 1000) * 100) / 100;
  oneColumnChange.selfTotal = Math.round((oneColumnChange.selfTotal / 1000) * 100) / 100;
  oneColumnChange.selfAvg = Math.round((oneColumnChange.selfAvg / 1000) * 100) / 100;
  oneColumnChange.selfMin = Math.round((oneColumnChange.selfMin / 1000) * 100) / 100;
  oneColumnChange.selfMax = Math.round((oneColumnChange.selfMax / 1000) * 100) / 100;
  oneColumnChange.percent = Math.round((oneColumnChange.percent / 1) * 100) / 100;
  // oneColumnChange.colorToPercent;
  return oneColumnChange;
}

/**
 * Is used if only one dropdown is selected.
 */
function valueFirstDropdown(selectedTagKey: string, trace: Trace) {
  let color = '';
  let allDiffColumnValues = [];
  const allSpans = trace.spans;
  // all possibilities that can be displayed
  if (selectedTagKey === serviceName) {
    const temp = _.chain(allSpans)
      .groupBy(x => x.process.serviceName)
      .map((value, key) => ({ key }))
      .uniq()
      .value();
    for (let i = 0; i < temp.length; i++) {
      allDiffColumnValues.push(temp[i].key);
    }
  } else if (selectedTagKey === operationName) {
    const temp = _.chain(allSpans)
      .groupBy(x => x.operationName)
      .map((value, key) => ({ key }))
      .uniq()
      .value();
    for (let i = 0; i < temp.length; i++) {
      allDiffColumnValues.push(temp[i].key);
    }
  } else {
    for (let i = 0; i < allSpans.length; i++) {
      for (let j = 0; j < allSpans[i].tags.length; j++) {
        if (allSpans[i].tags[j].key === selectedTagKey) {
          allDiffColumnValues.push(allSpans[i].tags[j].value);
        }
      }
    }
    allDiffColumnValues = [...new Set(allDiffColumnValues)];
  }
  // used to build the table
  const allTableValues = [];
  const spanWithNoSelectedTag = []; // is only needed when there are Others
  for (let i = 0; i < allDiffColumnValues.length; i++) {
    let resultValue = {
      selfTotal: 0,
      selfMin: trace.duration,
      selfMax: 0,
      selfAvg: 0,
      total: 0,
      avg: 0,
      min: trace.duration,
      max: 0,
      count: 0,
      percent: 0,
    };
    for (let j = 0; j < allSpans.length; j++) {
      if (selectedTagKey === serviceName) {
        if (allSpans[j].process.serviceName === allDiffColumnValues[i]) {
          resultValue = calculateContent(trace, allSpans[j], allSpans, resultValue);
          color = colorGenerator.getColorByKey(allSpans[j].process.serviceName);
        }
      } else if (selectedTagKey === operationName) {
        if (allSpans[j].operationName === allDiffColumnValues[i]) {
          resultValue = calculateContent(trace, allSpans[j], allSpans, resultValue);
        }
      } else {
        // used when a tag is selected
        for (let l = 0; l < allSpans[j].tags.length; l++) {
          if (allSpans[j].tags[l].value === allDiffColumnValues[i]) {
            resultValue = calculateContent(trace, allSpans[j], allSpans, resultValue);
          }
        }
      }
    }
    resultValue.selfAvg = resultValue.selfTotal / resultValue.count;
    resultValue.avg = resultValue.total / resultValue.count;
    let tableSpan = {
      hasSubgroupValue: true,
      name: allDiffColumnValues[i],
      count: resultValue.count,
      total: resultValue.total,
      avg: resultValue.avg,
      min: resultValue.min,
      max: resultValue.max,
      isDetail: false,
      selfTotal: resultValue.selfTotal,
      selfAvg: resultValue.selfAvg,
      selfMin: resultValue.selfMin,
      selfMax: resultValue.selfMax,
      percent: resultValue.percent,
      color,
      searchColor: '',
      parentElement: 'none',
      colorToPercent: 'transparent',
      traceID: '',
    };
    tableSpan = buildOneColumn(tableSpan);
    allTableValues.push(tableSpan);
  }
  // checks if there is OTHERS
  if (selectedTagKey !== serviceName && selectedTagKey !== operationName) {
    for (let i = 0; i < allSpans.length; i++) {
      let isIn = false;
      for (let j = 0; j < allSpans[i].tags.length; j++) {
        for (let l = 0; l < allDiffColumnValues.length; l++) {
          if (allSpans[i].tags[j].value === allDiffColumnValues[l]) {
            isIn = true;
          }
        }
      }
      if (!isIn) {
        spanWithNoSelectedTag.push(allSpans[i]);
      }
    }
    // Others is calculated
    let resultValue = {
      selfTotal: 0,
      selfAvg: 0,
      selfMin: trace.duration,
      selfMax: 0,
      total: 0,
      avg: 0,
      min: trace.duration,
      max: 0,
      count: 0,
      percent: 0,
    };
    for (let i = 0; i < spanWithNoSelectedTag.length; i++) {
      resultValue = calculateContent(trace, spanWithNoSelectedTag[i], allSpans, resultValue);
    }
    if (resultValue.count !== 0) {
      // Others is build
      resultValue.selfAvg = resultValue.selfTotal / resultValue.count;
      resultValue.avg = resultValue.total / resultValue.count;
      let tableSpanOTHERS = {
        hasSubgroupValue: false,
        name: `Without Tag: ${selectedTagKey}`,
        count: resultValue.count,
        total: resultValue.total,
        avg: resultValue.avg,
        min: resultValue.min,
        max: resultValue.max,
        isDetail: false,
        selfTotal: resultValue.selfTotal,
        selfAvg: resultValue.selfAvg,
        selfMin: resultValue.selfMin,
        selfMax: resultValue.selfMax,
        percent: resultValue.percent,
        color: '',
        searchColor: 'transparent',
        parentElement: '',
        colorToPercent: 'rgb(248,248,248)',
        traceID: '',
      };
      tableSpanOTHERS = buildOneColumn(tableSpanOTHERS);
      allTableValues.push(tableSpanOTHERS);
    }
  }
  return allTableValues;
}

/**
 * Creates columns for the children.
 */
function buildDetail(
  diffNamesA: string[],
  tempArray: TraceSpan[],
  allSpans: TraceSpan[],
  selectedTagKeySecond: string,
  parentName: string,
  isDetail: boolean,
  trace: Trace
) {
  const newColumnValues = [];
  for (let j = 0; j < diffNamesA.length; j++) {
    let color = '';
    let resultValue = {
      selfTotal: 0,
      selfAvg: 0,
      selfMin: trace.duration,
      selfMax: 0,
      total: 0,
      avg: 0,
      min: trace.duration,
      max: 0,
      count: 0,
      percent: 0,
    };
    for (let l = 0; l < tempArray.length; l++) {
      if (isDetail) {
        for (let a = 0; a < tempArray[l].tags.length; a++) {
          if (diffNamesA[j] === tempArray[l].tags[a].value) {
            resultValue = calculateContent(trace, tempArray[l], allSpans, resultValue);
          }
        }
      } else if (selectedTagKeySecond === serviceName) {
        if (diffNamesA[j] === tempArray[l].process.serviceName) {
          resultValue = calculateContent(trace, tempArray[l], allSpans, resultValue);
          color = colorGenerator.getColorByKey(tempArray[l].process.serviceName);
        }
      } else if (diffNamesA[j] === tempArray[l].operationName) {
        resultValue = calculateContent(trace, tempArray[l], allSpans, resultValue);
      }
    }
    resultValue.selfAvg = resultValue.selfTotal / resultValue.count;
    resultValue.avg = resultValue.total / resultValue.count;
    let buildOneColumnValue = {
      hasSubgroupValue: true,
      name: diffNamesA[j],
      count: resultValue.count,
      total: resultValue.total,
      avg: resultValue.avg,
      min: resultValue.min,
      max: resultValue.max,
      isDetail: true,
      selfTotal: resultValue.selfTotal,
      selfAvg: resultValue.selfAvg,
      selfMin: resultValue.selfMin,
      selfMax: resultValue.selfMax,
      percent: resultValue.percent,
      color,
      searchColor: '',
      parentElement: parentName,
      colorToPercent: 'rgb(248,248,248)',
      traceID: '',
    };
    buildOneColumnValue = buildOneColumn(buildOneColumnValue);
    newColumnValues.push(buildOneColumnValue);
  }
  return newColumnValues;
}

/**
 * Used to generate detail rest.
 */
function generateDetailRest(allColumnValues: ITableSpan[], selectedTagKeySecond: string, trace: Trace) {
  const allSpans = trace.spans;
  const newTable = [];
  for (let i = 0; i < allColumnValues.length; i++) {
    newTable.push(allColumnValues[i]);
    if (!allColumnValues[i].isDetail) {
      let resultValue = {
        selfTotal: 0,
        selfAvg: 0,
        selfMin: trace.duration,
        selfMax: 0,
        total: 0,
        avg: 0,
        min: trace.duration,
        max: 0,
        count: 0,
        percent: 0,
      };
      for (let j = 0; j < allSpans.length; j++) {
        if (
          allColumnValues[i].name === allSpans[j].process.serviceName ||
          allColumnValues[i].name === allSpans[j].operationName
        ) {
          let rest = true;
          for (let l = 0; l < allSpans[j].tags.length; l++) {
            if (allSpans[j].tags[l].key === selectedTagKeySecond) {
              rest = false;
              break;
            }
          }
          if (rest) {
            resultValue = calculateContent(trace, allSpans[j], allSpans, resultValue);
          }
        }
      }
      resultValue.avg = resultValue.total / resultValue.count;
      resultValue.selfAvg = resultValue.selfTotal / resultValue.count;
      if (resultValue.count !== 0) {
        let buildOneColumnValue = {
          hasSubgroupValue: false,
          name: `Without Tag: ${selectedTagKeySecond}`,
          count: resultValue.count,
          total: resultValue.total,
          avg: resultValue.avg,
          min: resultValue.min,
          max: resultValue.max,
          isDetail: true,
          selfTotal: resultValue.selfTotal,
          selfAvg: resultValue.selfAvg,
          selfMin: resultValue.selfMin,
          selfMax: resultValue.selfMax,
          percent: resultValue.percent,
          color: '',
          searchColor: '',
          parentElement: allColumnValues[i].name,
          colorToPercent: 'rgb(248,248,248)',
          traceID: '',
        };
        buildOneColumnValue = buildOneColumn(buildOneColumnValue);
        newTable.push(buildOneColumnValue);
      }
    }
  }
  return newTable;
}

/**
 * Used to get values if the second dropdown is selected.
 */
function valueSecondDropdown(
  actualTableValues: ITableSpan[],
  selectedTagKey: string,
  selectedTagKeySecond: string,
  trace: Trace
) {
  const allSpans = trace.spans;
  const allTableValues = [];

  for (let i = 0; i < actualTableValues.length; i++) {
    // if the table is already in the detail view, then these entries are not considered
    if (!actualTableValues[i].isDetail) {
      const tempArray = [];
      let diffNamesA = [] as any;
      // all Spans withe the same value (first dropdown)
      for (let j = 0; j < allSpans.length; j++) {
        if (selectedTagKey === serviceName) {
          if (actualTableValues[i].name === allSpans[j].process.serviceName) {
            tempArray.push(allSpans[j]);
            diffNamesA.push(allSpans[j].operationName);
          }
        } else if (selectedTagKey === operationName) {
          if (actualTableValues[i].name === allSpans[j].operationName) {
            tempArray.push(allSpans[j]);
            diffNamesA.push(allSpans[j].process.serviceName);
          }
          // if first dropdown is a tag
        } else {
          for (let l = 0; l < allSpans[j].tags.length; l++) {
            if (actualTableValues[i].name === allSpans[j].tags[l].value) {
              tempArray.push(allSpans[j]);
              if (selectedTagKeySecond === operationName) {
                diffNamesA.push(allSpans[j].operationName);
              } else if (selectedTagKeySecond === serviceName) {
                diffNamesA.push(allSpans[j].process.serviceName);
              }
            }
          }
        }
      }
      let newColumnValues = [] as any;
      // if second dropdown is no tag
      if (selectedTagKeySecond === serviceName || selectedTagKeySecond === operationName) {
        diffNamesA = [...new Set(diffNamesA)];
        newColumnValues = buildDetail(
          diffNamesA,
          tempArray,
          allSpans,
          selectedTagKeySecond,
          actualTableValues[i].name,
          false,
          trace
        );
      } else {
        // second dropdown is a tag
        diffNamesA = [] as any;
        for (let j = 0; j < tempArray.length; j++) {
          for (let l = 0; l < tempArray[j].tags.length; l++) {
            if (tempArray[j].tags[l].key === selectedTagKeySecond) {
              diffNamesA.push(tempArray[j].tags[l].value);
            }
          }
        }
        diffNamesA = [...new Set(diffNamesA)];
        newColumnValues = buildDetail(
          diffNamesA,
          tempArray,
          allSpans,
          selectedTagKeySecond,
          actualTableValues[i].name,
          true,
          trace
        );
      }
      allTableValues.push(actualTableValues[i]);
      if (newColumnValues.length > 0) {
        for (let j = 0; j < newColumnValues.length; j++) {
          allTableValues.push(newColumnValues[j]);
        }
      }
    }
  }
  // if second dropdown is a tag a rest must be created
  if (selectedTagKeySecond !== serviceName && selectedTagKeySecond !== operationName) {
    return generateDetailRest(allTableValues, selectedTagKeySecond, trace);
    // if no tag is selected the values can be returned
  }
  return allTableValues;
}

/**
 * Returns the values of the table shown after the selection of the first dropdown.
 * @param selectedTagKey the key which was selected
 */
export function getColumnValues(selectedTagKey: string, trace: Trace) {
  return valueFirstDropdown(selectedTagKey, trace);
}

/**
 * Returns the values of the table shown after the selection of the second dropdown.
 * @param actualTableValues actual values of the table
 * @param selectedTagKey first key which is selected
 * @param selectedTagKeySecond second key which is selected
 * @param trace whole information about the trace
 */
export function getColumnValuesSecondDropdown(
  actualTableValues: ITableSpan[],
  selectedTagKey: string,
  selectedTagKeySecond: string,
  trace: Trace
) {
  if (selectedTagKeySecond !== 'Reset') {
    return valueSecondDropdown(actualTableValues, selectedTagKey, selectedTagKeySecond, trace);
  }
  return getColumnValues(selectedTagKey, trace);
}
