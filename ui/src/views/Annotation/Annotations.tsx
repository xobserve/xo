import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import uPlot from 'uplot';



import AnnotationMarker from './AnnotationMarker';
import { EventsCanvas } from './EventsCanvas';
import useExtraTheme from 'hooks/useExtraTheme';
import { paletteColorNameToHex } from 'utils/colors';
import { SeriesData } from 'types/seriesData';
import { alpha } from 'components/uPlot/colorManipulator';
import { useStore } from '@nanostores/react';
import { $dashAnnotations } from '../dashboard/store/annotation';

interface AnnotationsPluginProps {
  options: uPlot.Options;
  dashboardId: string 
  panelId: number
}

export const AnnotationsPlugin = ({ dashboardId,panelId, options }: AnnotationsPluginProps) => {
  const annotations = useStore($dashAnnotations).filter(anno => anno.namespace == dashboardId && anno.group == panelId)
  const theme = useExtraTheme();
  const plotInstance = useRef<uPlot>();

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

      for (let i = 0; i < annotations.length; i++) {
        const annotation = annotations[i];

          if (!annotation.time) {
            continue;
          }

          let x0 = u.valToPos(annotation.time, 'x', true);
          const color = paletteColorNameToHex(annotation.color);
          renderLine(x0, color);

          if (annotation.timeEnd) {
            let x1 = u.valToPos(annotation.timeEnd, 'x', true);

            renderLine(x1, color);

            ctx.fillStyle = alpha(color, 0.1);
            ctx.rect(x0, u.bbox.top, x1 - x0, u.bbox.height);
            ctx.fill();
          }
      }
      ctx.restore();
      return;
    });
  }, [options, theme, annotations]);

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
    (annotation) => {
      let width = 0;
      if (plotInstance.current) {
        let x0 = plotInstance.current.valToPos(annotation.time, 'x');
        let x1 = plotInstance.current.valToPos(annotation.timeEnd, 'x');

        // markers are rendered relatively to uPlot canvas overly, not caring about axes width
        if (x0 < 0) {
          x0 = 0;
        }

        if (x1 > plotInstance.current.bbox.width / window.devicePixelRatio) {
          x1 = plotInstance.current.bbox.width / window.devicePixelRatio;
        }
        width = x1 - x0;
      }

      return <AnnotationMarker annotation={annotation}  width={width} />;
    },
    []
  );

  return (
    <EventsCanvas
      id="annotations"
      options={options}
      events={annotations}
      renderEventMarker={renderMarker}
      mapEventToXYCoords={mapAnnotationToXYCoords}
    />
  );
};