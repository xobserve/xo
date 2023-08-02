import { FrameVectorSource } from '../vectorSource';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import { FeatureLike } from 'ol/Feature';
import { Fill, RegularShape, Stroke, Circle, Style, Icon, Text } from 'ol/style';
import tinycolor from 'tinycolor2';
import useExtraTheme from 'hooks/useExtraTheme';
import { colors } from 'utils/colors';
import { Panel } from 'types/dashboard';

const defaultBaseSize = 10
const getMarkersLayer = (panel: Panel) => {
    const source = new FrameVectorSource<Point>()
    const layer = new VectorLayer({
        source: source,
    });
    layer.setStyle((feature: FeatureLike) => {
        const baseSize = panel.plugins.geomap.sizeScale.baseSize ?? defaultBaseSize
        let size;
        if (panel.plugins.geomap.sizeScale.enable) {
            const maxScale = panel.plugins.geomap.sizeScale.maxScale ?? 4
            const min = feature.get("min") ?? 1
            const max = feature.get("max") ?? 1

            let maxSizeScale = min == 0 ? max : (max / min)
            if (maxSizeScale > maxScale) {
                maxSizeScale = maxScale
            }
            const minSizeScale = 1
            const value = feature.get("value")
            const delta = maxSizeScale - minSizeScale
            let percent = 0;
            if (value !== -Infinity) {
                percent = (max - value!) / max;
            }
            const scale = maxSizeScale - percent * delta;
            size = scale * baseSize
        } else {
            size = baseSize
        }

        const color = feature.get("color")
        const opacity = feature.get("opacity")
        return circleMarker({ size: size, color: color, opacity: opacity })
    });
    return layer;

}
export default getMarkersLayer;


export const circleMarker = (cfg) => {
    const stroke = new Stroke({ color: cfg.color ?? colors[0], width: cfg.lineWidth ?? 1 });
    return new Style({
        image: new Circle({
            stroke,
            fill: getFillColor(cfg.opacity, cfg.color),
            radius: cfg.size,
        }),
        text: textLabel(cfg),
        stroke, // in case lines are sent to the markers layer
    });
};


export function getFillColor(opacity = 0.5, color = colors[0]) {
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