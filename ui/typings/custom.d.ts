// Copyright (c) 2019 Uber Technologies, Inc.
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

// For jest
declare const global: {
  location: Location;
}

declare interface Window {
  less: any;
  jQuery: any;
  $: any;
}

// For inlined envvars
declare const process: {
  env: {
    NODE_ENV: string;
    REACT_APP_GA_DEBUG?: string;
    REACT_APP_VSN_STATE?: string;
  }
}


interface JQueryPlot {
  (element: HTMLElement | JQuery, data: any, options: any): void;
  plugins: any[];
}

interface JQueryStatic {
  plot: JQueryPlot;
}

interface JQuery {
  place_tt: any;
  modal: any;
  tagsinput: any;
  typeahead: any;
  accessKey: any;
  tooltip: any;
}
