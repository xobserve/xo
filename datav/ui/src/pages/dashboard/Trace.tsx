// Copyright 2023 xObserve.io Team

import React from 'react'
import { useParams } from 'react-router-dom'
import TraceDetailWrapper from 'src/views/dashboard/plugins/built-in/panel/trace/components/TraceDetail/TraceDetailWrapper'

const TracePage = () => {
  const params = useParams()

  return (
    params.id &&
    params.datasourceId && (
      <TraceDetailWrapper id={params.id} dsId={params.datasourceId} />
    )
  )
}

export default TracePage
