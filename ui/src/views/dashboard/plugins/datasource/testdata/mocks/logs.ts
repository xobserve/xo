// Copyright 2023 Datav.io Team
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
    return [
        {
            "labels": {
                "filename": "/var/log/install.log",
                "job": "varlogs"
            },
            "values": [
                [
                    "1690967713398089000",
                    "2023-08-02 17:15:13+08 MacBook-Air SoftwareUpdateNotificationManager[7391]: SUOSUShimController: MSU update is not yet downloaded & prepared"
                ],
                [
                    "1690967713398084000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: Descriptor has changed since previous download (13.5 vs 13.4.1)"
                ],
                [
                    "1690967713398079000",
                    "\t)"
                ],
                [
                    "1690967713398072000",
                    "2023-08-02 17:15:13+08 MacBook-Air SoftwareUpdateNotificationManager[7391]: SUOSUShimController: Armed: 0, with mode: 0, date: (null), updates queued for later: ("
                ],
                [
                    "1690967713398065000",
                    "\t)"
                ],
                [
                    "1690967713398064000",
                    "\t    \"<SUOSUProduct: MSU_UPDATE_22G74_patch_13.5_minor>\""
                ],
                [
                    "1690967713398038000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: MSU updates found: ("
                ],
                [
                    "1690967713398035000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: SoftwareUpdate: request for status for unknown product MSU_UPDATE_22G74_patch_13.5_minor"
                ],
                [
                    "1690967713398033000",
                    "\t)"
                ],
                [
                    "1690967713398028000",
                    "\t    \"<SUOSUProduct: MSU_UPDATE_22G74_patch_13.5_minor>\""
                ],
                [
                    "1690967713398026000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: MSU updates found: ("
                ],
                [
                    "1690967713398023000",
                    "2023-08-02 17:15:13+08 MacBook-Air SoftwareUpdateNotificationManager[7391]: Controller: Received availableUpdatesChanged notification; new updates: [MSU_UPDATE_22G74_patch_13.5_minor]; new major updates: [032-69593, 042-01917, 032-84910, 002-75541, 042-15015, 032-97690, 032-82192, 032-71575, 032-63749]"
                ],
                [
                    "1690967713398017000",
                    "\t)"
                ],
                [
                    "1690967713398012000",
                    "2023-08-02 17:15:13+08 MacBook-Air SoftwareUpdateNotificationManager[7391]: External updates: ("
                ],
                [
                    "1690967713398010000",
                    "\t)"
                ],
                [
                    "1690967713397999000",
                    "\t    \"<SUOSUProduct: MSU_UPDATE_22G74_patch_13.5_minor>\""
                ],
                [
                    "1690967713397997000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: MSU updates found: ("
                ],
                [
                    "1690967713397987000",
                    "2023-08-02 17:15:13+08 MacBook-Air SoftwareUpdateNotificationManager[7391]: SUOSUShimController: MSU update is not yet downloaded & prepared"
                ],
                [
                    "1690967713397982000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: Descriptor has changed since previous download (13.5 vs 13.4.1)"
                ],
                [
                    "1690967713397970000",
                    "\t)"
                ],
                [
                    "1690967713397968000",
                    "\t    \"<SUOSUProduct: MSU_UPDATE_22G74_patch_13.5_minor>\""
                ],
                [
                    "1690967713397953000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: MSU updates found: ("
                ],
                [
                    "1690967713397949000",
                    "\t)"
                ],
                [
                    "1690967713397947000",
                    "2023-08-02 17:15:13+08 MacBook-Air SoftwareUpdateNotificationManager[7391]: SUOSUShimController: Armed: 0, with mode: 0, date: (null), updates queued for later: ("
                ],
                [
                    "1690967713397933000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: SoftwareUpdate: request for status for unknown product MSU_UPDATE_22G74_patch_13.5_minor"
                ],
                [
                    "1690967713397929000",
                    "2023-08-02 17:15:13+08 MacBook-Air SoftwareUpdateNotificationManager[7391]: AssertionMgr: Could not cancel com.apple.softwareupdate.NotifyAgentAssertion-BadgingCountChanged assertion - no assertion found for pid 7391"
                ],
                [
                    "1690967713397925000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: SUOSUServiceDaemon: Adding client: (null) (pid = 7391, uid = 501, path = /System/Library/PrivateFrameworks/SoftwareUpdate.framework/Versions/A/Resources/SoftwareUpdateNotificationManager.app/Contents/MacOS/SoftwareUpdateNotificationManager, connection remote object interface = <NSXPCInterface: 0x151f5c800>, exported interface = <NSXPCInterface: 0x151ff1c10>, remote object proxy = <__NSXPCInterfaceProxy_SUOSUServiceClientProtocol: 0x15287fd20>)"
                ],
                [
                    "1690967713397923000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: SoftwareUpdate: request for status for unknown product MSU_UPDATE_22G74_patch_13.5_minor"
                ],
                [
                    "1690967713397912000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: Adding client SUUpdateServiceClient pid=7391, uid=501, installAuth=NO rights=(), transactions=0 (/System/Library/PrivateFrameworks/SoftwareUpdate.framework/Versions/A/Resources/SoftwareUpdateNotificationManager.app/Contents/MacOS/SoftwareUpdateNotificationManager)"
                ],
                [
                    "1690967713397901000",
                    "\t)"
                ],
                [
                    "1690967713397895000",
                    "\t    \"<SUOSUProduct: MSU_UPDATE_22G74_patch_13.5_minor>\""
                ],
                [
                    "1690967713397891000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: MSU updates found: ("
                ],
                [
                    "1690967713397890000",
                    "2023-08-02 17:15:13+08 MacBook-Air SoftwareUpdateNotificationManager[7391]: Controller: Received availableUpdatesChanged notification; new updates: [MSU_UPDATE_22G74_patch_13.5_minor]; new major updates: [032-69593, 042-01917, 032-84910, 002-75541, 042-15015, 032-97690, 032-82192, 032-71575, 032-63749]"
                ],
                [
                    "1690967713397880000",
                    "\t)"
                ],
                [
                    "1690967713397873000",
                    "2023-08-02 17:15:13+08 MacBook-Air SoftwareUpdateNotificationManager[7391]: External updates: ("
                ],
                [
                    "1690967713397869000",
                    "2023-08-02 17:15:13+08 MacBook-Air SoftwareUpdateNotificationManager[7391]: AssertionMgr: Could not cancel com.apple.softwareupdate.NotifyAgentAssertion-BadgingCountChanged assertion - no assertion found for pid 7391"
                ],
                [
                    "1690967713397861000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: SUOSUServiceDaemon: Adding client: (null) (pid = 7391, uid = 501, path = /System/Library/PrivateFrameworks/SoftwareUpdate.framework/Versions/A/Resources/SoftwareUpdateNotificationManager.app/Contents/MacOS/SoftwareUpdateNotificationManager, connection remote object interface = <NSXPCInterface: 0x154da0560>, exported interface = <NSXPCInterface: 0x155ce4dc0>, remote object proxy = <__NSXPCInterfaceProxy_SUOSUServiceClientProtocol: 0x154d971b0>)"
                ],
                [
                    "1690967713397848000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: SoftwareUpdate: request for status for unknown product MSU_UPDATE_22G74_patch_13.5_minor"
                ],
                [
                    "1690967713397841000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: Adding client SUUpdateServiceClient pid=7391, uid=501, installAuth=NO rights=(), transactions=0 (/System/Library/PrivateFrameworks/SoftwareUpdate.framework/Versions/A/Resources/SoftwareUpdateNotificationManager.app/Contents/MacOS/SoftwareUpdateNotificationManager)"
                ],
                [
                    "1690967713397836000",
                    "\t)"
                ],
                [
                    "1690967713397832000",
                    "\t    \"<SUOSUProduct: MSU_UPDATE_22G74_patch_13.5_minor>\""
                ],
                [
                    "1690967713397829000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: MSU updates found: ("
                ],
                [
                    "1690967713397827000",
                    "2023-08-02 17:15:13+08 MacBook-Air SoftwareUpdateNotificationManager[7391]: AssertionMgr: Cancel com.apple.softwareupdate.NotifyAgentAssertion-BadgingCountChanged assertion for pid 7391, id 0x81D5"
                ],
                [
                    "1690967713397797000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: SUOSUServiceDaemon: Adding client: (null) (pid = 7391, uid = 501, path = /System/Library/PrivateFrameworks/SoftwareUpdate.framework/Versions/A/Resources/SoftwareUpdateNotificationManager.app/Contents/MacOS/SoftwareUpdateNotificationManager, connection remote object interface = <NSXPCInterface: 0x155c76900>, exported interface = <NSXPCInterface: 0x155ca1e80>, remote object proxy = <__NSXPCInterfaceProxy_SUOSUServiceClientProtocol: 0x154da67a0>)"
                ],
                [
                    "1690967713397775000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: 0 updates found:"
                ],
                [
                    "1690967713397768000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: Scan (f=1, d=0) completed "
                ],
                [
                    "1690967713397760000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: SoftwareUpdate: request for status for unknown product MSU_UPDATE_22G74_patch_13.5_minor"
                ],
                [
                    "1690967713397758000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: Adding client SUUpdateServiceClient pid=7391, uid=501, installAuth=NO rights=(), transactions=0 (/System/Library/PrivateFrameworks/SoftwareUpdate.framework/Versions/A/Resources/SoftwareUpdateNotificationManager.app/Contents/MacOS/SoftwareUpdateNotificationManager)"
                ],
                [
                    "1690967713397747000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: Refreshing available updates from scan"
                ],
                [
                    "1690967713397724000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: SUStatisticsManager: Successfully reported statistics for category 5"
                ],
                [
                    "1690967713397704000",
                    "2023-08-02 17:15:13+08 MacBook-Air SoftwareUpdateNotificationManager[7391]: AssertionMgr: Take com.apple.softwareupdate.NotifyAgentAssertion-BadgingCountChanged assertion with type BackgroundTask for pid 7391, id 0x81D5"
                ],
                [
                    "1690967713397682000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: SUScan: Elapsed scan time = 4.5"
                ],
                [
                    "1690967713146752000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: Failed to get bridge device"
                ],
                [
                    "1690967713146733000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: Failed to get bridge device"
                ],
                [
                    "1690967713146729000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: Package Authoring: error running installation-check script: TypeError: null is not an object (evaluating 'cpuFeatures.split') at x-distribution:///installer-gui-script%5B1%5D/installation-check%5B1%5D/@script"
                ],
                [
                    "1690967713146727000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: Failed to get bridge device"
                ],
                [
                    "1690967713146687000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: Failed to get bridge device"
                ],
                [
                    "1690967713146677000",
                    "2023-08-02 17:15:12+08 MacBook-Air softwareupdated[88542]: Package Authoring: error running installation-check script: TypeError: null is not an object (evaluating 'cpuFeatures.split') at x-distribution:///installer-gui-script%5B1%5D/installation-check%5B1%5D/@script"
                ],
                [
                    "1690967713146670000",
                    "2023-08-02 17:15:12+08 MacBook-Air softwareupdated[88542]: bridgeOS: Minimum bridge version requirement satisfied ((null)), skipping search for bridgeOS update"
                ],
                [
                    "1690967713146666000",
                    "2023-08-02 17:15:12+08 MacBook-Air softwareupdated[88542]: Failed to get bridge device"
                ],
                [
                    "1690967713146659000",
                    "2023-08-02 17:15:12+08 MacBook-Air softwareupdated[88542]: Failed to get bridge device"
                ],
                [
                    "1690967713146647000",
                    "2023-08-02 17:15:12+08 MacBook-Air softwareupdated[88542]: Package Authoring: error running installation-check script: TypeError: null is not an object (evaluating 'cpuFeatures.split') at x-distribution:///installer-gui-script%5B1%5D/installation-check%5B1%5D/@script"
                ],
                [
                    "1690967713146610000",
                    "2023-08-02 17:15:12+08 MacBook-Air softwareupdated[88542]: Failed to get bridge device"
                ],
                [
                    "1690967713146593000",
                    "2023-08-02 17:15:12+08 MacBook-Air softwareupdated[88542]: Failed to get bridge device"
                ],
                [
                    "1690967713146583000",
                    "2023-08-02 17:15:12+08 MacBook-Air softwareupdated[88542]: Package Authoring: error running installation-check script: TypeError: null is not an object (evaluating 'cpuFeatures.split') at x-distribution:///installer-gui-script%5B1%5D/installation-check%5B1%5D/@script"
                ],
                [
                    "1690967712895726000",
                    "2023-08-02 17:15:12+08 MacBook-Air softwareupdated[88542]: bridgeOS: Minimum bridge version requirement satisfied ((null)), skipping search for bridgeOS update"
                ],
                [
                    "1690967712895723000",
                    "2023-08-02 17:15:12+08 MacBook-Air softwareupdated[88542]: Failed to get bridge device"
                ],
                [
                    "1690967712895721000",
                    "2023-08-02 17:15:12+08 MacBook-Air softwareupdated[88542]: Failed to get bridge device"
                ],
                [
                    "1690967712895703000",
                    "2023-08-02 17:15:12+08 MacBook-Air softwareupdated[88542]: Failed to get bridge device"
                ],
                [
                    "1690967712895696000",
                    "2023-08-02 17:15:12+08 MacBook-Air softwareupdated[88542]: Failed to get bridge device"
                ],
                [
                    "1690967712895691000",
                    "2023-08-02 17:15:12+08 MacBook-Air softwareupdated[88542]: Package Authoring: error running installation-check script: TypeError: null is not an object (evaluating 'cpuFeatures.split') at x-distribution:///installer-gui-script%5B1%5D/installation-check%5B1%5D/@script"
                ],
                [
                    "1690967712895686000",
                    "2023-08-02 17:15:12+08 MacBook-Air softwareupdated[88542]: Failed to get bridge device"
                ],
                [
                    "1690967712895684000",
                    "2023-08-02 17:15:12+08 MacBook-Air softwareupdated[88542]: Failed to get bridge device"
                ],
                [
                    "1690967712895599000",
                    "2023-08-02 17:15:12+08 MacBook-Air softwareupdated[88542]: Failed to get bridge device"
                ],
                [
                    "1690967712895596000",
                    "2023-08-02 17:15:12+08 MacBook-Air softwareupdated[88542]: Failed to get bridge device"
                ],
                [
                    "1690967712895585000",
                    "2023-08-02 17:15:12+08 MacBook-Air softwareupdated[88542]: Package Authoring: error running installation-check script: TypeError: null is not an object (evaluating 'cpuFeatures.split') at x-distribution:///installer-gui-script%5B1%5D/installation-check%5B1%5D/@script"
                ],
                [
                    "1690967712895567000",
                    "2023-08-02 17:15:12+08 MacBook-Air softwareupdated[88542]: Failed to get bridge device"
                ],
                [
                    "1690967712895557000",
                    "2023-08-02 17:15:12+08 MacBook-Air softwareupdated[88542]: Failed to get bridge device"
                ],
                [
                    "1690967712895544000",
                    "2023-08-02 17:15:12+08 MacBook-Air softwareupdated[88542]: Failed to get bridge device"
                ],
                [
                    "1690967712895518000",
                    "2023-08-02 17:15:12+08 MacBook-Air softwareupdated[88542]: Failed to get bridge device"
                ],
                [
                    "1690967712895499000",
                    "2023-08-02 17:15:12+08 MacBook-Air softwareupdated[88542]: Package Authoring: error running installation-check script: TypeError: null is not an object (evaluating 'cpuFeatures.split') at x-distribution:///installer-gui-script%5B1%5D/installation-check%5B1%5D/@script"
                ],
                [
                    "1690967712895492000",
                    "2023-08-02 17:15:12+08 MacBook-Air softwareupdated[88542]: Package Authoring: error running installation-check script: TypeError: null is not an object (evaluating 'cpuFeatures.split') at x-distribution:///installer-gui-script%5B1%5D/installation-check%5B1%5D/@script"
                ],
                [
                    "1690967710887850000",
                    "2023-08-02 17:15:10+08 MacBook-Air softwareupdated[88542]: Failed to get bridge device"
                ],
                [
                    "1690967710887843000",
                    "2023-08-02 17:15:10+08 MacBook-Air softwareupdated[88542]: Failed to get bridge device"
                ],
                [
                    "1690967710887834000",
                    "2023-08-02 17:15:10+08 MacBook-Air softwareupdated[88542]: Package Authoring: error running installation-check script: TypeError: null is not an object (evaluating 'cpuFeatures.split') at x-distribution:///installer-gui-script%5B1%5D/installation-check%5B1%5D/@script"
                ],
                [
                    "1690967710887825000",
                    "2023-08-02 17:15:10+08 MacBook-Air softwareupdated[88542]: Package Authoring: error running installation-check script: TypeError: null is not an object (evaluating 'cpuFeatures.split') at x-distribution:///installer-gui-script%5B1%5D/installation-check%5B1%5D/@script"
                ],
                [
                    "1690967710887812000",
                    "2023-08-02 17:15:10+08 MacBook-Air softwareupdated[88542]: bridgeOS: Minimum bridge version requirement satisfied ((null)), skipping search for bridgeOS update"
                ],
                [
                    "1690967710887796000",
                    "2023-08-02 17:15:10+08 MacBook-Air softwareupdated[88542]: Failed to get bridge device"
                ],
                [
                    "1690967710887778000",
                    "2023-08-02 17:15:10+08 MacBook-Air softwareupdated[88542]: Failed to get bridge device"
                ],
                [
                    "1690967710887772000",
                    "2023-08-02 17:15:10+08 MacBook-Air softwareupdated[88542]: Package Authoring: error running installation-check script: TypeError: null is not an object (evaluating 'cpuFeatures.split') at x-distribution:///installer-gui-script%5B1%5D/installation-check%5B1%5D/@script"
                ],
                [
                    "1690967710636673000",
                    "2023-08-02 17:15:10+08 MacBook-Air softwareupdated[88542]: bridgeOS: Minimum bridge version requirement satisfied ((null)), skipping search for bridgeOS update"
                ],
                [
                    "1690967710636663000",
                    "2023-08-02 17:15:10+08 MacBook-Air softwareupdated[88542]: Failed to get bridge device"
                ],
                [
                    "1690967710636659000",
                    "2023-08-02 17:15:10+08 MacBook-Air softwareupdated[88542]: Failed to get bridge device"
                ],
                [
                    "1690967710636638000",
                    "2023-08-02 17:15:10+08 MacBook-Air softwareupdated[88542]: Package Authoring: error running installation-check script: TypeError: null is not an object (evaluating 'cpuFeatures.split') at x-distribution:///installer-gui-script%5B1%5D/installation-check%5B1%5D/@script"
                ],
                [
                    "1690967710636617000",
                    "2023-08-02 17:15:10+08 MacBook-Air softwareupdated[88542]: Package Authoring: error running installation-check script: TypeError: null is not an object (evaluating 'cpuFeatures.split') at x-distribution:///installer-gui-script%5B1%5D/installation-check%5B1%5D/@script"
                ],
                [
                    "1690967710636590000",
                    "2023-08-02 17:15:10+08 MacBook-Air softwareupdated[88542]: Package Authoring: error running installation-check script: TypeError: null is not an object (evaluating 'cpuFeatures.split') at x-distribution:///installer-gui-script%5B1%5D/installation-check%5B1%5D/@script"
                ],
                [
                    "1690967710636556000",
                    "2023-08-02 17:15:10+08 MacBook-Air softwareupdated[88542]: Package Authoring: error running installation-check script: TypeError: null is not an object (evaluating 'cpuFeatures.split') at x-distribution:///installer-gui-script%5B1%5D/installation-check%5B1%5D/@script"
                ],
                [
                    "1690967710636549000",
                    "2023-08-02 17:15:10+08 MacBook-Air softwareupdated[88542]: JS: No bundle at/Applications/SafeView.app"
                ],
                [
                    "1690967710386088000",
                    "2023-08-02 17:15:10+08 MacBook-Air softwareupdated[88542]: Package Authoring: error running installation-check script: TypeError: null is not an object (evaluating 'cpuFeatures.split') at x-distribution:///installer-gui-script%5B1%5D/installation-check%5B1%5D/@script"
                ],
                [
                    "1690967710386084000",
                    "2023-08-02 17:15:10+08 MacBook-Air softwareupdated[88542]: Failed to get bridge device"
                ]
            ]
        },
        {
            "labels": {
                "filename": "/var/log/test.log",
                "job": "varlogs"
            },
            "values": [
                [
                    "1690967713398089000",
                    "2023-08-02 17:15:13+08 MacBook-Air SoftwareUpdateNotificationManager[7391]: SUOSUShimController: MSU update is not yet downloaded & prepared"
                ],
                [
                    "1690967713398084000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: Descriptor has changed since previous download (13.5 vs 13.4.1)"
                ],
                [
                    "1690967713398079000",
                    "\t)"
                ],
                [
                    "1690967713398072000",
                    "2023-08-02 17:15:13+08 MacBook-Air SoftwareUpdateNotificationManager[7391]: SUOSUShimController: Armed: 0, with mode: 0, date: (null), updates queued for later: ("
                ],
                [
                    "1690967713398065000",
                    "\t)"
                ],
                [
                    "1690967713398064000",
                    "\t    \"<SUOSUProduct: MSU_UPDATE_22G74_patch_13.5_minor>\""
                ],
                [
                    "1690967713398038000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: MSU updates found: ("
                ],
                [
                    "1690967713398035000",
                    "2023-08-02 17:15:13+08 MacBook-Air softwareupdated[88542]: SoftwareUpdate: request for status for unknown product MSU_UPDATE_22G74_patch_13.5_minor"
                ]
            ]
        }
    ]
}
