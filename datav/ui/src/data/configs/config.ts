// Copyright 2023 xObserve.io Team

import { MenuItem } from 'types/teams'

import { atom } from 'nanostores'
import { Role } from 'types/role'

// limitations under the License.
const config: UIConfig = {
  appName: 'xobserve',
  repoUrl: 'https://github.com/xObserve/xobserve',
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
  tenant: {
    enable: false,
  },
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
  tenant?: {
    enable: boolean
  }
  currentTenant?: number
  tenantName?: string
  tenantRole?: Role
  currentTeam?: number
  teamRole?: Role
}
