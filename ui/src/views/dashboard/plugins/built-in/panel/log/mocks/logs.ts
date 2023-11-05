// Copyright 2023 observex.io Team
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

import { TimeRange } from "types/time"

export const getMockLogs = (timeRange: TimeRange) => {
    const end = timeRange.start.getTime() * 1e6
    const start = timeRange.end.getTime() * 1e6
    const step = (start - end) / 10
    return [
        {
            "labels": {
                "filename": "/var/log/install.log",
                "job": "varlogs"
            },
            "values": [
                [
                    start,
                    "MacBook-Air SoftwareUpdateNotificationManager[7391]: SUOSUShimController: MSU update is not yet downloaded & prepared"
                ],
                [
                    start - step * 1,
                    "MacBook-Air softwareupdated[88542]: Descriptor has changed since previous download (13.5 vs 13.4.1)"
                ],
                [
                    start - step * 2,
                    "\t)"
                ],
                [
                    start - step * 3,
                    "MacBook-Air SoftwareUpdateNotificationManager[7391]: SUOSUShimController: Armed: 0, with mode: 0, date: (null), updates queued for later: ("
                ],
                [
                    start - step * 4,
                    "\t)"
                ],
                [
                    start - step * 5,
                    "\t    \"<SUOSUProduct: MSU_UPDATE_22G74_patch_13.5_minor>\""
                ],
                [
                    start - step * 6,
                    " MacBook-Air softwareupdated[88542]: MSU updates found: ("
                ],
                [
                    start - step * 7,
                    "MacBook-Air softwareupdated[88542]: SoftwareUpdate: request for status for unknown product MSU_UPDATE_22G74_patch_13.5_minor"
                ],
                [
                    start - step * 8,
                    "\t)"
                ],
                [
                    start - step * 9,
                    "\t    \"<SUOSUProduct: MSU_UPDATE_22G74_patch_13.5_minor>\""
                ],
                [
                    start - step * 10,
                    "MacBook-Air softwareupdated[88542]: MSU updates found: ("
                ],
            ]
        },
        {
            "labels": {
                "filename": "/var/log/test.log",
                "job": "varlogs"
            },
            "values": [
                [
                    start,
                    "MacBook-Air SoftwareUpdateNotificationManager[7391]: SUOSUShimController: MSU update is not yet downloaded & prepared"
                ],
                [
                    start - step * 1,
                    "MacBook-Air softwareupdated[88542]: Descriptor has changed since previous download (13.5 vs 13.4.1)"
                ],
                [
                    start - step * 2,
                    "\t)"
                ],
                [
                    start - step * 3,
                    "MacBook-Air SoftwareUpdateNotificationManager[7391]: SUOSUShimController: Armed: 0, with mode: 0, date: (null), updates queued for later: ("
                ],
                [
                    start - step * 4,
                    "\t)"
                ],
                [
                    start - step * 5,
                    "\t    \"<SUOSUProduct: MSU_UPDATE_22G74_patch_13.5_minor>\""
                ],
                [
                    start - step * 6,
                    "MacBook-Air softwareupdated[88542]: MSU updates found: ("
                ],
                [
                    start - step * 7,
                    "MacBook-Air softwareupdated[88542]: SoftwareUpdate: request for status for unknown product MSU_UPDATE_22G74_patch_13.5_minor"
                ]
            ]
        }
    ]
}
