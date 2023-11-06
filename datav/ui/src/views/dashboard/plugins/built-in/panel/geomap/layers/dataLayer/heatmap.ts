import HeatmapLayer from 'ol/layer/Heatmap.js';
import { FrameVectorSource } from '../vectorSource';
import { Point } from 'ol/geom';


const getHeatmapLayer = () => {   
    const source = new FrameVectorSource<Point>()
    return  new HeatmapLayer({
        source: source,
        weight: function (feature) {
          return feature.get('_weight');
        },
        radius: 15,
        blur: 15,
    });
    
}   
export default getHeatmapLayer;