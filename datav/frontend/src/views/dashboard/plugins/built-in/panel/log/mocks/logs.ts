// Copyright 2023 xObserve.io Team

import { TimeRange } from 'types/time'

export const getMockLogs = (timeRange: TimeRange) => {
  const end = timeRange.start.getTime() * 1e6
  const start = timeRange.end.getTime() * 1e6
  const step = (start - end) / 10
  return [
    {
      labels: {
        filename: '/var/log/install.log',
        job: 'varlogs',
      },
      values: [
        [
          start,
          'MacBook-Air SoftwareUpdateNotificationManager[7391]: SUOSUShimController: MSU update is not yet downloaded & prepared',
        ],
        [
          start - step * 1,
          'MacBook-Air softwareupdated[88542]: Descriptor has changed since previous download (13.5 vs 13.4.1)',
        ],
        [start - step * 2, '\t)'],
        [
          start - step * 3,
          'MacBook-Air SoftwareUpdateNotificationManager[7391]: SUOSUShimController: Armed: 0, with mode: 0, date: (null), updates queued for later: (',
        ],
        [start - step * 4, '\t)'],
        [
          start - step * 5,
          '\t    "<SUOSUProduct: MSU_UPDATE_22G74_patch_13.5_minor>"',
        ],
        [
          start - step * 6,
          ' MacBook-Air softwareupdated[88542]: MSU updates found: (',
        ],
        [
          start - step * 7,
          'MacBook-Air softwareupdated[88542]: SoftwareUpdate: request for status for unknown product MSU_UPDATE_22G74_patch_13.5_minor',
        ],
        [start - step * 8, '\t)'],
        [
          start - step * 9,
          '\t    "<SUOSUProduct: MSU_UPDATE_22G74_patch_13.5_minor>"',
        ],
        [
          start - step * 10,
          'MacBook-Air softwareupdated[88542]: MSU updates found: (',
        ],
      ],
    },
    {
      labels: {
        filename: '/var/log/test.log',
        job: 'varlogs',
      },
      values: [
        [
          start,
          'MacBook-Air SoftwareUpdateNotificationManager[7391]: SUOSUShimController: MSU update is not yet downloaded & prepared',
        ],
        [
          start - step * 1,
          'MacBook-Air softwareupdated[88542]: Descriptor has changed since previous download (13.5 vs 13.4.1)',
        ],
        [start - step * 2, '\t)'],
        [
          start - step * 3,
          'MacBook-Air SoftwareUpdateNotificationManager[7391]: SUOSUShimController: Armed: 0, with mode: 0, date: (null), updates queued for later: (',
        ],
        [start - step * 4, '\t)'],
        [
          start - step * 5,
          '\t    "<SUOSUProduct: MSU_UPDATE_22G74_patch_13.5_minor>"',
        ],
        [
          start - step * 6,
          'MacBook-Air softwareupdated[88542]: MSU updates found: (',
        ],
        [
          start - step * 7,
          'MacBook-Air softwareupdated[88542]: SoftwareUpdate: request for status for unknown product MSU_UPDATE_22G74_patch_13.5_minor',
        ],
      ],
    },
  ]
}
