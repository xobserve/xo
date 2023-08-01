import { FrameVectorSource } from '../vectorSource';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import { FeatureLike } from 'ol/Feature';
import { Fill, RegularShape, Stroke, Circle, Style, Icon, Text } from 'ol/style';
import tinycolor from 'tinycolor2';
import useExtraTheme from 'hooks/useExtraTheme';
import { colors } from 'utils/colors';
import { Panel } from 'types/dashboard';

const baseSize = 10
const getMarkersLayer = (panel: Panel) => {   
    const source = new FrameVectorSource<Point>()
    const layer = new VectorLayer({
        source: source,
    });
    layer.setStyle((feature: FeatureLike) => {
        const min = feature.get("min")??1
        const max = feature.get("max")??1
        
        let maxSizeScale = min == 0 ? max : (max / min)
        if (maxSizeScale > 4) {
            maxSizeScale = 4
        }
        const minSizeScale = 1
        const value = feature.get("value")
        const delta = maxSizeScale - minSizeScale
        let percent = 0;
        if (value !== -Infinity) {
          percent = (max - value!) / max;
        }

        const scale =  maxSizeScale - percent * delta;

        const color = feature.get("color")
        const opacity = feature.get("opacity")
        // const idx = feature.get('rowIndex') as number;
        // const dims = style.dims;
        // if (!dims || !isNumber(idx)) {
        //   return style.maker(style.base);
        // }

        // const values = { ...style.base };

        // if (dims.color) {
        //   values.color = dims.color.get(idx);
        // }
        // if (dims.size) {
        //   values.size = dims.size.get(idx);
        // }
        // if (dims.text) {
        //   values.text = dims.text.get(idx);
        // }
        // if (dims.rotation) {
        //   values.rotation = dims.rotation.get(idx);
        // }
        // return style.maker(values);
        return circleMarker({size: scale * baseSize, color: color,opacity: opacity})
      });
    return  layer;
    
}   
export default getMarkersLayer;


export const circleMarker = (cfg) => {
    const stroke = new Stroke({ color: cfg.color??colors[0], width: cfg.lineWidth ?? 1 });
    return new Style({
      image: new Circle({
        stroke,
        fill: getFillColor(cfg.opacity, cfg.color),
        radius: cfg.size ?? baseSize,
      }),
      text: textLabel(cfg),
      stroke, // in case lines are sent to the markers layer
    });
  };
  

  export function getFillColor(opacity=0.5, color=colors[0]) {
    if (opacity === 1) {
      return new Fill({ color: color });
    }
    if (opacity > 0) {
      color = tinycolor(color).setAlpha(opacity).toRgbString();
      return new Fill({ color });
    }
    return undefined;
  }
  

  const textLabel = (cfg) => {
    if (!cfg?.text) {
      return undefined;
    }
  
    const fontFamily = useExtraTheme().typography.fontFamily;
    const textConfig = {
      ...defaultStyleConfig.textConfig,
      ...cfg?.textConfig,
    };
    return new Text({
      text: cfg?.text,
      fill: new Fill({ color: cfg?.color ?? 'inherit' }),
      font: `normal ${textConfig.fontSize}px ${fontFamily}`,
      ...textConfig,
    });
  };

  export const defaultStyleConfig = Object.freeze({
    size: {
      fixed: 5,
      min: 2,
      max: 15,
    },
    color: {
      fixed: 'dark-green', // picked from theme
    },
    opacity: 0.4,
    textConfig: {
      fontSize: 12,
      textAlign: "center",
      textBaseline: "middle",
      offsetX: 0,
      offsetY: 0,
    }
  });