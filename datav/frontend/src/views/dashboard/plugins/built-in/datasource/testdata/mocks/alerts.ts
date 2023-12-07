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

import { random } from 'lodash'
import { TimeRange } from 'types/time'

export const getMockAlerts = (timeRange: TimeRange) => {
  const start = timeRange.start.getTime()
  const end = timeRange.end.getTime()
  const time1 = random(start, end)
  const time2 = random(start, end)
  const time3 = random(start, end)
  const now = new Date().toISOString()
  return {
    status: 'success',
    data: {
      groups: [
        {
          name: 'example',
          file: 'first_rules.yml',
          rules: [
            {
              state: 'pending',
              name: 'TestData_HighRequestLatency',
              query: 'go_gc_duration_seconds_count > 20',
              duration: 120,
              keepFiringFor: 0,
              labels: {
                severity: 'page',
              },
              annotations: {
                summary: 'High request latency',
              },
              alerts: [
                {
                  labels: {
                    alertname: 'HighRequestLatency',
                    instance: 'localhost:9100',
                    job: 'node',
                    severity: 'page',
                  },
                  annotations: {
                    summary: 'High request latency',
                  },
                  state: 'firing',
                  activeAt: new Date(time1).toISOString(),
                  value: '1.9168e+04',
                },
                {
                  labels: {
                    alertname: 'HighRequestLatency',
                    instance: 'localhost:9090',
                    job: 'prometheus',
                    severity: 'page',
                  },
                  annotations: {
                    summary: 'High request latency',
                  },
                  state: 'pending',
                  activeAt: new Date(time1 + 2).toISOString(),
                  value: '5.2e+01',
                },
              ],
              health: 'ok',
              evaluationTime: 0.00189025,
              lastEvaluation: now,
              type: 'alerting',
            },
          ],
          interval: 15,
          limit: 0,
          evaluationTime: 0.00193375,
          lastEvaluation: now,
        },

        {
          name: 'service',
          file: 'first_rules.yml',
          rules: [
            {
              state: 'firing',
              name: 'TestData_Errors',
              query: 'go_errors > 20',
              duration: 120,
              keepFiringFor: 0,
              labels: {
                severity: 'critical',
              },
              annotations: {
                summary: 'Errors happend in pay service',
              },
              alerts: [
                {
                  labels: {
                    alertname: 'HighRequestLatency',
                    instance: 'localhost:9100',
                    job: 'node',
                    severity: 'critical',
                  },
                  annotations: {
                    summary: 'High request latency',
                  },
                  state: 'firing',
                  activeAt: new Date(time2).toISOString(),
                  value: '1.9168e+04',
                },
                {
                  labels: {
                    alertname: 'HighRequestLatency',
                    instance: 'localhost:9090',
                    job: 'prometheus',
                    severity: 'critical',
                  },
                  annotations: {
                    summary: 'High request latency',
                  },
                  state: 'resolved',
                  activeAt: new Date(time2 + 3).toISOString(),
                  value: '5.2e+01',
                },
              ],
              health: 'ok',
              evaluationTime: 0.00189025,
              lastEvaluation: now,
              type: 'alerting',
            },
          ],
          interval: 15,
          limit: 0,
          evaluationTime: 0.00193375,
          lastEvaluation: now,
        },

        {
          name: 'datebase',
          file: 'first_rules.yml',
          rules: [
            {
              state: 'resolved',
              name: 'TestData_Resolved',
              query: 'go_errors > 30',
              duration: 120,
              keepFiringFor: 0,
              labels: {
                severity: 'critical',
              },
              annotations: {
                summary: 'Errors happend in pay service',
              },
              alerts: [
                {
                  labels: {
                    alertname: 'HighRequestLatency',
                    instance: 'localhost:9101',
                    job: 'node',
                    severity: 'critical',
                  },
                  annotations: {
                    summary: 'High request latency',
                  },
                  state: 'resolved',
                  activeAt: new Date(time3).toISOString(),
                  value: '1.9168e+04',
                },
              ],
              health: 'ok',
              evaluationTime: 0.00189025,
              lastEvaluation: now,
              type: 'alerting',
            },
          ],
          interval: 15,
          limit: 0,
          evaluationTime: 0.00193375,
          lastEvaluation: now,
        },
      ],
    },
  }
}
