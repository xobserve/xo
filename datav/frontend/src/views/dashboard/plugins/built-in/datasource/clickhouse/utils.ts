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

import { Panel, PanelQuery } from "types/dashboard";

import { TimeRange } from "types/time";
import { isEmpty } from "utils/validate";
import { PanelTypeGraph } from "../../../built-in/panel/graph/types";
import { PanelTypeBar } from "../../../built-in/panel/bar/types";
import { PanelTypeStat } from "../../../built-in/panel/stat/types";
import { DataFormat } from "types/format";
import {
  queryPluginDataToTable,
  queryPluginDataToTimeSeries,
} from "utils/plugins";
import { QueryPluginData } from "types/plugin";

export const clickhouseToPanelData = (
  data: QueryPluginData,
  panel: Panel,
  query: PanelQuery,
  range: TimeRange
) => {
  if (isEmpty(data) || data.columns.length == 0 || data.data.length == 0) {
    return null;
  }

  let expandTimeRange;
  const et = query.data["expandTimeline"];

  if (isEmpty(et) || et == "auto") {
    expandTimeRange =
      panel.type == PanelTypeGraph ||
      panel.type == PanelTypeBar ||
      panel.type == PanelTypeStat;
  } else {
    expandTimeRange = et == "always";
  }

  switch (query.data["format"]) {
    case DataFormat.TimeSeries:
      return queryPluginDataToTimeSeries(data, query);
    case DataFormat.Table:
      return queryPluginDataToTable(data, query);
    default:
      return queryPluginDataToTimeSeries(data, query);
  }
};
