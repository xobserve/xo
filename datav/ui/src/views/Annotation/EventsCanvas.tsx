// Copyright 2023 xObserve.io Team

import React, { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useMountedState } from 'react-use'
import uPlot from 'uplot'

import { Marker } from './Marker'
import { XYCanvas } from './XYCanvas'
import { Annotation } from 'types/annotation'

interface EventsCanvasProps {
  id: string
  options: uPlot.Options
  events: Annotation[]
  renderEventMarker: (annotation) => React.ReactNode
  mapEventToXYCoords: any
}

export function EventsCanvas({
  id,
  events,
  renderEventMarker,
  mapEventToXYCoords,
  options,
}: EventsCanvasProps) {
  const plotInstance = useRef<uPlot>()
  // render token required to re-render annotation markers. Rendering lines happens in uPlot and the props do not change
  // so we need to force the re-render when the draw hook was performed by uPlot
  const [renderToken, setRenderToken] = useState(0)
  const isMounted = useMountedState()

  useLayoutEffect(() => {
    options.hooks.init?.push((u) => {
      plotInstance.current = u
    })

    options.hooks.draw.push(() => {
      if (!isMounted()) {
        return
      }
      setRenderToken((s) => s + 1)
    })
  }, [options, setRenderToken])

  const eventMarkers = useMemo(() => {
    const markers: React.ReactNode[] = []

    if (!plotInstance.current || events.length === 0) {
      return markers
    }

    for (let i = 0; i < events.length; i++) {
      const anno = events[i]
      const coords = mapEventToXYCoords(anno)
      if (!coords) {
        continue
      }
      markers.push(
        <Marker {...coords} key={`${id}-marker-${i}`}>
          {renderEventMarker(anno)}
        </Marker>,
      )
    }

    return <>{markers}</>
  }, [events, renderEventMarker, renderToken])

  if (!plotInstance.current) {
    return null
  }

  return (
    <XYCanvas
      left={plotInstance.current.bbox.left / window.devicePixelRatio}
      top={plotInstance.current.bbox.top / window.devicePixelRatio}
    >
      {eventMarkers}
    </XYCanvas>
  )
}
