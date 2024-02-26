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

import { MenuItem } from 'types/teams'

import { atom } from 'nanostores'
import { Role } from 'types/role'

//@ts-ignore
export const URL_ROOT_PATH = import.meta.env.VITE_URL_ROOT_PATH

// limitations under the License.
const config: UIConfig = {
  appName: 'xobserve',
  repoUrl: 'https://github.com/xobserve/xo',
  panel: {
    echarts: {
      enableBaiduMap: false,
      baiduMapAK: '',
    },
  },
  showAlertIcon: false,
  githubOAuthToken: '',
  enableGithubLogin: false,
  sidemenu: null,
  observability: {
    enable: false,
  },
  // tenant: {
  //   enable: false,
  // },
}

export const $config = atom<UIConfig>(null)

export interface UIConfig {
  appName?: string
  repoUrl?: string
  panel?: {
    echarts: {
      enableBaiduMap: boolean
      baiduMapAK: string
    }
  }
  dashboard?: {
    enableDelete: boolean
    showSidemenuItems: boolean
  }
  showAlertIcon?: boolean
  githubOAuthToken?: string
  enableGithubLogin?: boolean
  sidemenu?: MenuItem[]
  plugins?: {
    disablePanels: string[]
    disableDatasources: string[]
  }
  observability?: {
    enable: boolean
  }
  // tenant?: {
  //   enable: boolean
  // }
  currentTenant?: number
  tenantName?: string
  tenantRole?: Role
  currentTeam?: number
  teamRole?: Role
}
