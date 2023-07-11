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

export interface ITableSpan {
    hasSubgroupValue: boolean; // True when the entry has the subgroup tag in it.
    name: string;
    count: number;
    total: number;
    avg: number;
    min: number;
    max: number;
    selfTotal: number;
    selfAvg: number;
    selfMin: number;
    selfMax: number;
    percent: number;
    isDetail: boolean; // True when the entry represents a subgroup aggregation.
    parentElement: string;
    color: string; // If it is a service name, the color will be set.
    searchColor: string;
    colorToPercent: string; // Color created by percent
    traceID: string;
  }
  
  export interface ITableValues {
    uid: string;
    value: number;
  }
  
  export interface IColumnValue {
    title: string;
    attribute: string;
    suffix: string;
    isDecimal: boolean;
  }
  