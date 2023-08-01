import { Feature } from 'ol';
import { Geometry, LineString, Point } from 'ol/geom';
import VectorSource from 'ol/source/Vector';
import { Field, FieldType, SeriesData } from 'types/seriesData';
import { fromLonLat } from 'ol/proj'
import countries from 'public/plugins/panel/geomap/countries.json'
import { count } from 'console';
import { Panel } from 'types/dashboard';
import { getThreshold } from 'components/Threshold/utils';
import { ThresholdsMode } from 'types/threshold';
import { paletteColorNameToHex } from 'utils/colors';

// "geometry": {
//     "type": "Point",
//     "coordinates": [
//         117.655556,
//         24.513333
//     ]
// },

export class FrameVectorSource<T extends Geometry = Geometry> extends VectorSource<T> {
    constructor() {
        super();
    }

    update(data: SeriesData[], panel: Panel) {
        this.clear(true);
        let info = {
            name: "Geometry",
            type: "geo",
            points: [],
            codes: [],
            names: [],
            values: [],
            colors: []
        }

        let min;
        let max;

        const thresholds = panel.plugins.geomap.thresholds
        if (thresholds.mode == ThresholdsMode.Percentage) {
            for (const s of data) {
                let value = 0;
                for (const field of s.fields) {
                    if (field.type == FieldType.Number && field.values.length > 0) {
                        value = field.values[field.values.length - 1]
                        if (min == undefined || value < min) {
                            min = value
                        }
                        if (max == undefined || value > max) {
                            max = value
                        }
                        break
                    }
                }
            }
        }


        for (const s of data) {
            const code = s.name
            //@performance: use a map
            const country = countries.find(c => c.key == code || c.keys?.includes(code))
            if (country) {
                const point = new Point(fromLonLat([country.longitude, country.latitude]));
                info.points.push(point)
                info.codes.push(code)
                info.names.push(country.name)
                let value = 0;
                for (const field of s.fields) {
                    if (field.type == FieldType.Number && field.values.length > 0) {
                        value = field.values[field.values.length - 1]
                        if (thresholds.mode != ThresholdsMode.Percentage) {
                            if (min == undefined || value < min) {
                                min = value
                            }
                            if (max == undefined || value > max) {
                                max = value
                            }
                        }
                        break
                    }

                }
                const threshold = getThreshold(value, thresholds, max)
                info.values.push(value)
                info.colors.push(paletteColorNameToHex(threshold.color))
            }
        }
        for (let i = 0; i < info.points.length; i++) {
            this.addFeatureInternal(
                new Feature({
                    code: info.codes[i],
                    name: info.names[i],
                    value: info.values[i],
                    min: min,
                    max: max,
                    rowIndex: i,
                    geometry: info.points[i] as T,
                    opacity: panel.plugins.geomap.dataLayer.opacity,
                    color: info.colors[i]
                })
            );
        }

        // only call this at the end
        this.changed();
    }
}