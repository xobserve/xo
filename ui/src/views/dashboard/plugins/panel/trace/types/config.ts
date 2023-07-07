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

import { TPathAgnosticDecorationSchema } from './path-agnostic-decorations';
import { TNil } from './misc';

export type ConfigMenuItem = {
  label: string;
  url?: string;
  anchorTarget?: '_self' | '_blank' | '_parent' | '_top';
};

export type ConfigMenuGroup = {
  label: string;
  items: readonly ConfigMenuItem[];
};

export type TScript = {
  text: string;
  type: 'inline';
};

export type LinkPatternsConfig = {
  // type defines the entity that the pattern applies to.
  // 'traces' patterns apply to the whole trace, and have access to 'traceID' value.
  // Other patterns apply to tags at different levels. They have access to the value
  // of the respective tag, for example:
  //   "linkPatterns": [{
  //     "type": "process",
  //     "key": "jaeger.version",
  //     "url": "https://github.com/jaegertracing/jaeger-client-java/releases/tag/#{jaeger.version}",
  //     "text": "Information about Jaeger SDK release #{jaeger.version}"
  //   }]
  type: 'process' | 'tags' | 'logs' | 'traces';
  // key of the tag for tag-level patterns.
  key?: string;
  // url of the link, with variable extrapoliation, e.g. "#{jaeger.version}".
  url: string;
  // tooltip of the link, with variable extrapoliation, e.g. "#{jaeger.version}".
  text: string;
};

export type MonitorEmptyStateConfig = {
  mainTitle?: string;
  subTitle?: string;
  description?: string;
  button?: {
    text?: string;
    onClick?: Function;
  };
  info?: string;
  alert?: {
    message?: string;
    type?: 'success' | 'info' | 'warning' | 'error';
  };
};

export type MonitorConfig = {
  menuEnabled?: boolean;
  emptyState?: MonitorEmptyStateConfig;
  docsLink?: string;
};

export type TraceGraphConfig = {
  // layoutManagerMemory controls the total memeory available for the GraphViz
  // Emscripten module instance. The value should be a power of two.
  // The default of 16MB should be sufficient for most cases — only consider
  // using a larger number if you run into the error "Cannot enlarge memory arrays".
  // See https://github.com/jaegertracing/jaeger-ui/issues/1249 for background
  layoutManagerMemory?: number;
};

// Default values are provided in packages/jaeger-ui/src/constants/default-config.tsx
export type Config = {
  // archiveEnabled enables the Archive Trace button in the trace view.
  // Requires Query Service to be configured with "archive" storage backend.
  archiveEnabled?: boolean;

  // dependencies controls the behavior of System Architecture tab.
  dependencies?: {
    // menuEnabled enables or disables the System Architecture tab.
    menuEnabled?: boolean;

    // dagMaxNumServices defines the maximum number of services allowed
    // before the DAG dependency view is disabled. Too many services
    // cause the DAG view to be non-responsive.
    dagMaxNumServices?: number;
  };

  // menu controls the dropdown menu in the top-right corner of the UI.
  // When populated, this element completely overrides the default menu.
  menu: readonly (ConfigMenuGroup | ConfigMenuItem)[];

  // search section controls some aspects of the Search panel.
  search?: {
    // maxLookback controls how far back in time the search may apply.
    // By default the Lookback dropdown contains values from "last hour"
    // to "last 2 days". Setting maxLookback to a shorter time range,
    // such as "6h" disables the longer ranges.
    maxLookback: {
      // label to be displayed in the search form dropdown, e.g. "Last 2 days".
      label: string;

      // The value submitted in the search query if the label is selected.
      // Examples: "6h", "2d".
      value: string;
    };
    // maxLimit configures the "search depth" parameter.
    // The interpretation of search depth varies between different backends.
    maxLimit: number;
  };

  // scripts is an array of URLs of additional JavaScript files to be loaded.
  // TODO when is it useful?
  scripts?: readonly TScript[];

  // topTagPrefixes defines a set of prefixes for span tag names that are considered
  // "important" and cause the matching tags to appear higher in the list of tags.
  // For example, topTagPrefixes=['http.'] would cause all span tags that begin with
  // "http." to be shown above all other tags.
  // See https://github.com/jaegertracing/jaeger-ui/issues/218 for background.
  topTagPrefixes?: readonly string[];

  // tracking section controls the collection of usage metrics as analytics events.
  // By default, Jaeger uses Google Analytics for event tracking (if enabled).
  tracking?: {
    // gaID is the Google Analytics account ID.
    gaID: string | TNil;

    // trackErrors enables the use of Raven SDK to capture rich details
    // about the exceptions and report them as analytics events.
    // See https://github.com/jaegertracing/jaeger-ui/issues/39 for background.
    trackErrors: boolean | TNil;
    customWebAnalytics: any
  };

  // linkPatterns allow customizing the display of traces with external links.
  // The patterns can apply either at trace level, or at individual tag level.
  // When a matching pattern is found, a link is rendered, whose URL and tooltip
  // strings support variable substitution.
  // A trace level link is displayed as an icon at the top of the trace view.
  // A tag-level link converts the tag value into a hyperlink.
  linkPatterns?: readonly LinkPatternsConfig[];

  // monitor section controls Service Performance Monitoring tab.
  monitor?: MonitorConfig;

  // traceGraph controls the trace graph under trace page
  traceGraph?: TraceGraphConfig;

  // Disables the file upload control.
  disableFileUploadControl: boolean;

  // Disables the json view.
  disableJsonView: boolean;

  // Alters all targets of links to empty or top to
  // prevent the creation of a new page.
  forbidNewPage: boolean;

  // The following features are experimental / undocumented.

  deepDependencies?: {
    menuEnabled?: boolean;
  };
  pathAgnosticDecorations?: readonly TPathAgnosticDecorationSchema[];
  qualityMetrics?: {
    menuEnabled?: boolean;
    menuLabel?: string;
  };
};
