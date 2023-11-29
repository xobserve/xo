// Copyright 2023 xObserve.io Team

import { useColorMode } from '@chakra-ui/react'
import { getCurrentTimeRange } from 'src/components/DatePicker/TimePicker'
import React, { useEffect, useState } from 'react'
import {
  ReloadDashAnnotationsEvent,
  TimeChangedEvent,
} from 'src/data/bus-events'
import { Dashboard } from 'types/dashboard'
import useBus from 'use-bus'
import { requestApi } from 'utils/axios/request'
import { paletteColorNameToHex } from 'utils/colors'
import { roundDsTime } from 'utils/datasource'
import { $dashAnnotations, $rawDashAnnotations } from './store/annotation'
import { isEmpty } from 'utils/validate'
import { useStore } from '@nanostores/react'

interface Props {
  dashboard: Dashboard
}
const DashboardAnnotations = ({ dashboard }: Props) => {
  const { colorMode } = useColorMode()
  const rawAnnotations = useStore($rawDashAnnotations)
  useBus(
    (e) => e.type == TimeChangedEvent || e.type == ReloadDashAnnotationsEvent,
    (e) => {
      loadAnnotations()
    },
    [dashboard],
  )

  useEffect(() => {
    loadAnnotations()
  }, [])

  useEffect(() => {
    filterAnnotations(rawAnnotations)
  }, [rawAnnotations])

  useEffect(() => {
    if (rawAnnotations.length > 0) {
      filterAnnotations(rawAnnotations)
    }
  }, [dashboard.data.annotation.tagsFilter, dashboard.data.annotation.color])

  const loadAnnotations = async () => {
    const timerange = getCurrentTimeRange()
    const res = await requestApi.get(
      `/annotation/${dashboard.id}?start=${roundDsTime(
        timerange.start.getTime() / 1000,
      )}&end=${roundDsTime(timerange.end.getTime() / 1000)}`,
    )
    $rawDashAnnotations.set(res.data)
  }

  const filterAnnotations = (annotations) => {
    const newAnnotations = []
    for (const anno of annotations) {
      anno.color = paletteColorNameToHex(
        dashboard.data.annotation.color,
        colorMode,
      )
      const tf = dashboard.data.annotation.tagsFilter
      if (!isEmpty(tf)) {
        const tagsFilter = tf.split(',')
        if (anno.tags.some((t) => tagsFilter.includes(t))) {
          newAnnotations.push(anno)
        }
      } else {
        newAnnotations.push(anno)
      }
    }
    $dashAnnotations.set([...newAnnotations])
  }
  return <></>
}

export default DashboardAnnotations
