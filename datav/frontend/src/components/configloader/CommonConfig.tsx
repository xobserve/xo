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

import React, { useEffect, useMemo, useState } from 'react'
import { $config, UIConfig, URL_ROOT_PATH } from '../../data/configs/config'
import { requestApi } from 'utils/axios/request'
import { useToast } from '@chakra-ui/react'

const CommonConfig = ({ children }) => {
  const toast = useToast()
  const [cfg, setConfig] = useState<UIConfig>($config.get())

  let rawPath = location.pathname
  if (rawPath.startsWith(URL_ROOT_PATH)) {
    rawPath = rawPath.replace(URL_ROOT_PATH, '')
  }

  const teamPath = useMemo(() => {
    let firstIndex
    let secondIndex
    let i = 0

    for (const c of rawPath) {
      if (c == '/') {
        if (firstIndex === undefined) {
          firstIndex = i
          i++
          continue
        }

        if (secondIndex === undefined) {
          secondIndex = i
          break
        }
      }
      i++
    }

    const teamPath = rawPath.slice(firstIndex + 1, secondIndex)
    return teamPath
  }, [location.pathname])

  const teamId = Number(teamPath)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    const res = await requestApi.get(
      `/config/ui${isNaN(teamId) ? '' : `?teamId=${teamId}`}`,
    )

    const cfg: UIConfig = res.data
    if (
      cfg.currentTeam != teamId &&
      rawPath != '' &&
      rawPath != '/' &&
      !rawPath.startsWith(`/admin/`)
    ) {
      toast({
        title: `You have no privilege to view team ${teamPath}, please visit root path to navigate to your current team`,
        status: 'warning',
        duration: 5000,
        isClosable: true,
      })

      // let newPath
      // if (location.pathname == "" || location.pathname == "/") {
      //   newPath = `/${cfg.currentTeam}`
      // } else {
      //   newPath = location.pathname.replace(`/${teamPath}`, `/${cfg.currentTeam}`)
      // }
      // setTimeout(() => {
      //   window.location.href = newPath
      // }, 1500)
      return
    }

    cfg.sidemenu = (cfg.sidemenu as any).data
      .flat()
      .filter((item) => !item.hidden)
    setConfig(cfg)
    $config.set(cfg)
  }

  return <>{cfg && children}</>
}

export default CommonConfig
