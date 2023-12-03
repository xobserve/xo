// Copyright 2023 xObserve.io Team

import { Box, Tooltip, useColorMode, useColorModeValue } from '@chakra-ui/react'
import { useStore } from '@nanostores/react'
import { use } from 'echarts'
import React, { useEffect, useState } from 'react'
import { AiFillStar, AiOutlineStar } from 'react-icons/ai'
import { FaStar } from 'react-icons/fa'
import { dashboardMsg } from 'src/i18n/locales/en'
import { requestApi } from 'utils/axios/request'

interface Props {
  dashboardId: string
  starred?: boolean
  fontSize?: string
  colorScheme?: 'gray' | 'orange'
  enableClick?: boolean
}

const DashboardStar = (props: Props) => {
  const t1 = useStore(dashboardMsg)
  const {
    dashboardId,
    fontSize = '1rem',
    colorScheme = 'orange',
    enableClick = true,
  } = props
  const [starred, setStarred] = useState(props.starred)

  useEffect(() => {
    load()
  }, [])
  const load = async () => {
    const res = await requestApi.get(`/dashboard/starred/${dashboardId}`)
    setStarred(res.data)
  }

  const onStar = async () => {
    if (!starred) {
      await requestApi.post(`/dashboard/star/${dashboardId}`)
    } else {
      await requestApi.post(`/dashboard/unstar/${dashboardId}`)
    }

    setStarred(!starred)
  }
  return (
    <Tooltip label={starred ? t1.starTips : t1.unstarTips}>
      <Box
        cursor='pointer'
        onClick={enableClick ? onStar : null}
        fontSize={fontSize}
        color={
          colorScheme == 'orange'
            ? useColorModeValue('orange.300', 'orange.200')
            : 'inherit'
        }
      >
        {starred ? <AiFillStar /> : <AiOutlineStar />}
      </Box>
    </Tooltip>
  )
}

export default DashboardStar
