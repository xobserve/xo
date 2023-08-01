import React, { useEffect, useState } from 'react';


import { TooltipView } from './TooltipView';
import { TooltipContainer } from '../../graph/Tooltip/Tooltip';
// import { Portal } from '@chakra-ui/portal';
import { Map, MapBrowserEvent } from 'ol';
import { toLonLat } from 'ol/proj';
import { Portal } from 'components/portal/Portal';

interface Props {
  map: Map
}

export const GeomapTooltip = ({ map }: Props) => {
  const [tooltip, setTooltip] = useState(null)
  function onHover (evt: MapBrowserEvent<MouseEvent>)  {
    const mouse = evt.originalEvent;
    const pixel = map.getEventPixel(mouse);
    const hover = toLonLat(map.getCoordinateFromPixel(pixel));

    let hoverPayload = {} as any
    hoverPayload.pageX = mouse.pageX;
    hoverPayload.pageY = mouse.pageY;
    hoverPayload.point = {
      lat: hover[1],
      lon: hover[0],
    };
    hoverPayload.data = [];

    map.forEachFeatureAtPixel(
      pixel,
      (feature, layer, geo) => {
        const props = feature.getProperties();
        if (props) {
          hoverPayload.data.push(props)
        }


      }
    );

    if (hoverPayload.data.length > 0) {
      setTooltip(hoverPayload)
    } else {
      setTooltip(null)
    }

    return hoverPayload.data.length > 0
  };
  
  useEffect(() => {
    map.on('pointermove', onHover);
    return  () => {
      map.un('pointermove', onHover);
    }
  }, [map])

  return (
    <>
      {tooltip && tooltip.data.length > 0 && (
        <Portal>
          <TooltipContainer position={{ x: tooltip.pageX, y: tooltip.pageY }} offset={{ x: 0, y: 0 }} allowPointerEvents>
            <TooltipView tooltip={tooltip} />
          </TooltipContainer>
        </Portal>
      )}
    </>
  );
};
