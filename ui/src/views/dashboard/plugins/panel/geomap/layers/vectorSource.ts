import { Feature } from 'ol';
import { Geometry, Point } from 'ol/geom';
import VectorSource from 'ol/source/Vector';
import { Field, FieldType, SeriesData } from 'types/seriesData';
import { fromLonLat } from 'ol/proj'
import countries from 'public/plugins/panel/geomap/countries.json'
import countryNames from 'public/plugins/panel/geomap/countryNames.json'
import cities from 'public/plugins/panel/geomap/cities.json'
import { Panel } from 'types/dashboard';
import { getThreshold } from 'src/components/Threshold/utils';
import { ThresholdsMode } from 'types/threshold';
import { paletteColorNameToHex } from 'utils/colors';
import { formatUnit } from 'src/components/Unit';
import { calcValueOnArray } from 'utils/seriesData';
import { findOverride, findRuleInOverride } from 'utils/dashboard/panel';
import { GeomapRules } from '../OverridesEditor';
import { isEmpty } from 'lodash';

// "geometry": {
//     "type": "Point",
//     "coordinates": [
//         117.655556,
//         24.513333
//     ]
// },

export class FrameVectorSource<T extends Geometry = Geometry> extends VectorSource<T> {
    constructor() {
        super({});
    }

    update(data: SeriesData[], panel: Panel) {
        this.clear(true);

        if (isEmpty(data)) {
            this.changed()
            return 
        }

        let info = {
            name: "Geometry",
            type: "geo",
            points: [],
            codes: [],
            names: [],
            values: [],
            displayValues: [],
            colors: [],
            opacities: [],
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
            const code = s.name.toLowerCase()
            let location = countries[code] ?? countryNames[code.toLowerCase()]  ?? cities[code]
            if (!location) {
                const  f = s.fields.find(f => f.type == FieldType.Geo)
                if (f) {
                    location = [s.name, f.values]
                }
            }
            const override = findOverride(panel, s.name)
 
            if (location) {
                const point = new Point(fromLonLat(location[1]));
                info.points.push(point)
                info.codes.push(findRuleInOverride(override, GeomapRules.LocationName)??code)
                info.names.push(location[0])
                let value = 0;
                for (const field of s.fields) {
                    if (field.type == FieldType.Number && field.values.length > 0) {
                        value = calcValueOnArray(field.values, panel.plugins.geomap.value.calc)
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
                
                const threshold = getThreshold(value, findRuleInOverride(override, GeomapRules.LocationThresholds)??thresholds, max)
                info.values.push(value)
                info.colors.push(paletteColorNameToHex(threshold.color))
                info.displayValues.push(formatUnit(value, panel.plugins.geomap.value.units,  panel.plugins.geomap.value.decimal))
                info.opacities.push(findRuleInOverride(override, GeomapRules.LocationFill)?? panel.plugins.geomap.dataLayer.opacity)
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
                    opacity: info.opacities[i],
                    color: info.colors[i],
                    display: info.displayValues[i]
                })
            );
        }

        // only call this at the end
        this.changed();
    }
}