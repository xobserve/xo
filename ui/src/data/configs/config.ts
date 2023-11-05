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

import { MenuItem } from "types/teams";


import { atom } from 'nanostores'



// limitations under the License.
const config: UIConfig = {
    appName: 'observex',
    repoUrl: 'https://github.com/data-observe/observex',
    panel: {
        echarts: {
            enableBaiduMap: false,
            baiduMapAK: ''
        }
    },
    showAlertIcon: false,
    githubOAuthToken: '',
    enableGithubLogin: false,
    sidemenu: null,
    observability: {
        enable: false
    }
};

export const $config = atom<UIConfig>(config)

export interface UIConfig {
    appName?: string
    repoUrl?: string
    panel?: {
        echarts: {
            enableBaiduMap: boolean
            baiduMapAK: string
        }
    }
    showAlertIcon?: boolean
    githubOAuthToken?: string
    enableGithubLogin?: boolean
    sidemenu?: MenuItem[]
    plugins?: {
        disablePanels   : string[]   
        disableDatasources: string[]  
    }
    observability?: {
        enable: boolean
    }
}
