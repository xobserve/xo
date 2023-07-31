import { GeoMapSettings } from "types/panel/plugins";
import { ArcGisMapServer, BaseLayerType } from "types/plugins/geoMap";
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Map from 'ol/Map';
import XYZ from 'ol/source/XYZ';

const arcGisbase = "https://services.arcgisonline.com/ArcGIS/rest/services/"
//  `${base}${svc}/MapServer/tile/{z}/{y}/{x}`
const getBaseMap = (options: GeoMapSettings) => {
    let url;
    let mapServer 
    switch (options.baseMap.mapServer) {
      case ArcGisMapServer.Ocean:
        mapServer = "Ocean/World_Ocean_Base"
        break;
      case ArcGisMapServer.Topographic:
        mapServer = "World_Topo_Map"
        break;
      case ArcGisMapServer.UsaTopo:
        mapServer = "USA_Topo_Maps"
        break;
      default:
        mapServer = options.baseMap.mapServer
        break;
    }
    switch (options.baseMap.layer) {
        case BaseLayerType.OpenStreet:
            return new TileLayer({
                source: new OSM(),
              });
        case BaseLayerType.ArcGis:
            url = `${arcGisbase}${mapServer}/MapServer/tile/{z}/{y}/{x}`;
            return  new TileLayer({
                source: new XYZ({
                  url: url
                })
              })
        case BaseLayerType.Custom:
            return new TileLayer({
                source: new XYZ({
                  url: options.baseMap.url,
                  attributions: options.baseMap.attr, // singular?
                }),
                // minZoom: cfg.minZoom,
                // maxZoom: cfg.maxZoom,
              });
        default:
            break;
    }
}

export default getBaseMap