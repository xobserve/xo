import GeoJSON from 'ol/format/GeoJSON.js';
import HeatmapLayer from 'ol/layer/Heatmap.js';
import VectorSource from 'ol/source/Vector.js';

const heatmapLayer = new HeatmapLayer({
    source: new VectorSource({
        url: 'https://openlayers.org/en/latest/examples/data/geojson/world-cities.geojson',
        format: new GeoJSON(),
    }),
    weight: function (feature) {
        return feature.get('population') / 1e7;
    },
    radius: 15,
    blur: 15,
});

export default heatmapLayer;