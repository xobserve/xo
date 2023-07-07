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


import { FALLBACK_DAG_MAX_NUM_SERVICES } from './constants';

import { Config } from '../types/config';

const defaultConfig: Config = {
  archiveEnabled: false,
  dependencies: {
    dagMaxNumServices: FALLBACK_DAG_MAX_NUM_SERVICES,
    menuEnabled: true,
  },
  menu: [
    {
      label: 'About Jaeger',
      items: [
        {
          label: 'Website/Docs',
          url: 'https://www.jaegertracing.io/',
        },
        {
          label: 'Blog',
          url: 'https://medium.com/jaegertracing/',
        },
        {
          label: 'Twitter',
          url: 'https://twitter.com/JaegerTracing',
        },
        {
          label: 'Discussion Group',
          url: 'https://groups.google.com/forum/#!forum/jaeger-tracing',
        },
        {
          label: 'Online Chat',
          url: 'https://cloud-native.slack.com/archives/CGG7NFUJ3',
        },
        {
          label: 'GitHub',
          url: 'https://github.com/jaegertracing/',
        }
      ],
    },
  ],
  search: {
    maxLookback: {
      label: '2 Days',
      value: '2d',
    },
    maxLimit: 1500,
  },
  tracking: {
    gaID: null,
    trackErrors: true,
  },
  linkPatterns: [],
  monitor: {
    menuEnabled: true,
    emptyState: {
      mainTitle: 'Get started with Service Performance Monitoring',
      subTitle:
        'A high-level monitoring dashboard that helps you cut down the time to identify and resolve anomalies and issues.',
      description:
        'Service Performance Monitoring aggregates tracing data into RED metrics and visualizes them in service and operation level dashboards.',
      button: {
        text: 'Read the Documentation',
        onClick: () => window.open('https://www.jaegertracing.io/docs/latest/spm/'),
      },
      alert: {
        message: 'Service Performance Monitoring requires a Prometheus-compatible time series database.',
        type: 'info',
      },
    },
    docsLink: 'https://www.jaegertracing.io/docs/latest/spm/',
  },
  disableFileUploadControl: false,
  disableJsonView: false,
  forbidNewPage: false,
  traceGraph: {
    layoutManagerMemory: undefined,
  },

  deepDependencies: {
    menuEnabled: false,
  },
  qualityMetrics: {
    menuEnabled: false,
    menuLabel: 'Trace Quality',
  },
};

// Fields that should be merged with user-supplied config values rather than overwritten.
type TMergeField = 'dependencies' | 'search' | 'tracking';
export const mergeFields: readonly TMergeField[] = ['dependencies', 'search', 'tracking'];

export default defaultConfig;

export const deprecations = [
  {
    formerKey: 'dependenciesMenuEnabled',
    currentKey: 'dependencies.menuEnabled',
  },
  {
    formerKey: 'gaTrackingID',
    currentKey: 'tracking.gaID',
  },
];
