// Copyright 2023 Datav.io Team
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

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import uPlot from 'uplot';
import AnnotationMarker from './AnnotationMarker';
import { EventsCanvas } from './EventsCanvas';
import useExtraTheme from 'hooks/useExtraTheme';
import { paletteColorNameToHex } from 'utils/colors';
import { alpha } from 'components/uPlot/colorManipulator';
import { useStore } from '@nanostores/react';
import { $dashAnnotations, $rawDashAnnotations } from '../dashboard/store/annotation';
import { durationToSeconds } from 'utils/date';
import { Annotation } from 'types/annotation';
import AnnotationEditor from './AnnotationEditor';
import { requestApi } from 'utils/axios/request';
import { dispatch } from 'use-bus';
import { PanelForceRebuildEvent } from 'src/data/bus-events';
import { cloneDeep } from 'lodash';

interface AnnotationsPluginProps {
  options: uPlot.Options;
  namespace: string
  group: number
}

export const AnnotationsPlugin = ({ namespace, group, options }: AnnotationsPluginProps) => {
  const annotations0 = useStore($dashAnnotations).filter(anno => anno.namespace == namespace && anno.group == group)
  const annotations = useRef<Annotation[]>(null)


  const theme = useExtraTheme();
  const plotInstance = useRef<uPlot>();
  const [annotation, setAnnotation] = useState<Annotation>(null)
  
  useEffect(() => {
    annotations.current = annotations0
    if (plotInstance.current) {
      plotInstance.current.redraw()
    }
  },[annotations0])

  useLayoutEffect(() => {
    options.hooks.init.push((u) => {
      plotInstance.current = u;
    });

    options.hooks.draw.push((u) => {
      // Render annotation lines on the canvas
      const ctx = u.ctx;
      if (!ctx) {
        return;
      }
    
      ctx.save();
      ctx.beginPath();
      ctx.rect(u.bbox.left, u.bbox.top, u.bbox.width, u.bbox.height);
      ctx.clip();

      const renderLine = (x: number, color: string) => {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.setLineDash([5, 5]);
        ctx.moveTo(x, u.bbox.top);
        ctx.lineTo(x, u.bbox.top + u.bbox.height);
        ctx.stroke();
        ctx.closePath();
      };

      for (let i = 0; i < annotations.current.length; i++) {
        const annotation = annotations.current[i];

        if (!annotation.time) {
          continue;
        }

        let x0 = u.valToPos(annotation.time, 'x', true);
        const color = paletteColorNameToHex(annotation.color);
        renderLine(x0, color);

        const timeEnd = annotation.time + durationToSeconds(annotation.duration)
        let x1 = u.valToPos(timeEnd, 'x', true);

        renderLine(x1, color);

        ctx.fillStyle = alpha(color, 0.1);
        ctx.rect(x0, u.bbox.top, x1 - x0, u.bbox.height);
        ctx.fill();
      }
      ctx.restore();
      return;
    });
  }, [options, theme]);

  const mapAnnotationToXYCoords = useCallback((annotation, dataFrameFieldIndex) => {
    if (!annotation.time || !plotInstance.current) {
      return undefined;
    }
    let x = plotInstance.current.valToPos(annotation.time, 'x');

    if (x < 0) {
      x = 0;
    }

    return {
      x,
      y: plotInstance.current.bbox.height / window.devicePixelRatio + 4,
    };
  }, []);



  const renderMarker = useCallback(
    (annotation: Annotation) => {
      let width = 0;
      if (plotInstance.current) {
        let x0 = plotInstance.current.valToPos(annotation.time, 'x');
        const timeEnd = annotation.time + durationToSeconds(annotation.duration)
        let x1 = plotInstance.current.valToPos(timeEnd, 'x');

        // markers are rendered relatively to uPlot canvas overly, not caring about axes width
        if (x0 < 0) {
          x0 = 0;
        }

        if (x1 > plotInstance.current.bbox.width / window.devicePixelRatio) {
          x1 = plotInstance.current.bbox.width / window.devicePixelRatio;
        }
        width = x1 - x0;
      }

      return <AnnotationMarker annotation={annotation} width={width} onEditAnnotation={() => setAnnotation(annotation)} onRemoveAnnotation={() => onRemoveAnnotation(annotation)}/>;
    },
    []
  );

  return (
    <>
      <EventsCanvas
        id="annotations"
        options={options}
        events={annotations0}
        renderEventMarker={renderMarker}
        mapEventToXYCoords={mapAnnotationToXYCoords}
      />
      {annotation && <AnnotationEditor annotation={annotation} onEditorClose={() => {
        setAnnotation(null)
        // plotInstance.current.setSelect({ top: 0, left: 0, width: 0, height: 0 });
      }} />}
    </>

  );
};

export const onRemoveAnnotation = async (annotation: Annotation) => {
  await requestApi.delete(`/annotation/${annotation.namespace}/${annotation.id}`)
  const index = $rawDashAnnotations.get().findIndex(a => a.id == annotation.id)
  const annos = $rawDashAnnotations.get()
  annos.splice(index, 1)
  $rawDashAnnotations.set([...annos])
}