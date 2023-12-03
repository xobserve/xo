// Copyright 2023 xObserve.io Team

import React, { useEffect, useState } from 'react'
import { $config, UIConfig } from '../../data/configs/config'
import { requestApi } from 'utils/axios/request'

const BasicConfig = ({ children }) => {
  const [cfg, setConfig] = useState<UIConfig>($config.get())

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    const res = await requestApi.get(`/config/ui?basic=true`)
    const cfg: UIConfig = res.data
    setConfig(cfg)
    $config.set(cfg)
  }

  return <>{cfg && children}</>
}

export default BasicConfig
