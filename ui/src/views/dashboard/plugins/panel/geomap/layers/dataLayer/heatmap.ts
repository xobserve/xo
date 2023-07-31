import GeoJSON from 'ol/format/GeoJSON.js';
import HeatmapLayer from 'ol/layer/Heatmap.js';
import VectorSource from 'ol/source/Vector.js';
import { SeriesData } from 'types/seriesData';
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