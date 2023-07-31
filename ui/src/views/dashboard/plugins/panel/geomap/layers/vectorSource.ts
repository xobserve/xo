import { Feature } from 'ol';
import { Geometry, LineString, Point } from 'ol/geom';
import VectorSource from 'ol/source/Vector';
import { Field, SeriesData } from 'types/seriesData';
import { fromLonLat } from 'ol/proj'
import countries from 'public/plugins/panel/geomap/countries.json'
import { count } from 'console';

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

    update(data: SeriesData[]) {
        this.clear(true);
        let info = {
            name: "Geometry",
            type: "geo",
            points: [],
            values: []
        }
    
        for (const s of data) {
            const location = s.name
            //@performance: use a map
            // console.log("here33333:",location)
            const country = countries.find(c => c.key == location || c.keys?.includes(location))
            // console.log("here33333:",location, country)
            if (country) {
                const point = new Point(fromLonLat([country.longitude, country.latitude]));
                info.points.push(point)
            }
        }
        for (let i = 0; i < info.points.length; i++) {
            this.addFeatureInternal(
                new Feature({
                    population: 4000,
                    rowIndex: i,
                    geometry: info.points[i] as T,
                })
            );
        }

        // only call this at the end
        this.changed();
    }

    // updateLineString(frame: SeriesData) {
    //     this.clear(true);
    //     const info = getGeometryField(frame, this.location);
    //     if (!info.field) {
    //         this.changed();
    //         return;
    //     }

    //     //eslint-disable-next-line
    //     const field = info.field as Field<Point>;
    //     //  传给 LineString 的参数: [[
    //     //     117.655556,
    //     //     24.513333
    //     // ]]
    //     const geometry = new LineString(field.values.map((p) => p.getCoordinates())) as Geometry;
    //     this.addFeatureInternal(
    //         new Feature({
    //             frame,
    //             rowIndex: 0,
    //             geometry: geometry as T,
    //         })
    //     );

    //     // only call this at the end
    //     this.changed();
    // }
}