// Copyright 2023 xObserve.io Team
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

import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useMountedState } from 'react-use';
import uPlot from 'uplot';



import { Marker } from './Marker';
import { XYCanvas } from './XYCanvas';
import { Annotation } from 'types/annotation';

interface EventsCanvasProps {
  id: string;
  options: uPlot.Options;
  events: Annotation[];
  renderEventMarker: (annotation) => React.ReactNode;
  mapEventToXYCoords: any
}

export function EventsCanvas({ id, events, renderEventMarker, mapEventToXYCoords, options }: EventsCanvasProps) {
  const plotInstance = useRef<uPlot>();
  // render token required to re-render annotation markers. Rendering lines happens in uPlot and the props do not change
  // so we need to force the re-render when the draw hook was performed by uPlot
  const [renderToken, setRenderToken] = useState(0);
  const isMounted = useMountedState();

  useLayoutEffect(() => {
    options.hooks.init?.push((u) => {
        plotInstance.current = u;
      })

    options.hooks.draw.push( () => {
      if (!isMounted()) {
        return;
      }
      setRenderToken((s) => s + 1);
    });
  }, [options, setRenderToken]);

  const eventMarkers = useMemo(() => {
    const markers: React.ReactNode[] = [];

    if (!plotInstance.current || events.length === 0) {
      return markers;
    }

    for (let i = 0; i < events.length; i++) {
      const anno = events[i];
        const coords = mapEventToXYCoords(anno);
        if (!coords) {
          continue;
        }
        markers.push(
          <Marker {...coords} key={`${id}-marker-${i}`}>
            {renderEventMarker(anno)}
          </Marker>
        );
      }

    return <>{markers}</>;
  }, [events, renderEventMarker, renderToken]);

  if (!plotInstance.current) {
    return null;
  }

  return (
    <XYCanvas
      left={plotInstance.current.bbox.left / window.devicePixelRatio}
      top={plotInstance.current.bbox.top / window.devicePixelRatio}
    >
      {eventMarkers}
    </XYCanvas>
  );
}
