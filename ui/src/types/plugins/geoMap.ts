// Copyright 2023 Datav.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

export enum BaseLayerType {
    OpenStreet = "Open Street Map",
    ArcGis = "ArcGIS Map Server",
    Custom = "Custom"
}

export enum ArcGisMapServer {
    WorldStreet = "World_Street_Map",
    WorldImagery = "World_Imagery",
    WorldPhysical = "World_Physical_Map",
    Topographic = "Topographic",
    UsaTopo = "USA_Topographic",
    Ocean = "World_Ocean",
    // Custom = "Custom MapServer"
}

export enum DataLayerType {
    Heatmap = "Heatmap",
    Markers = "Markers"
}

export interface GeoMapDataLayer {
    type: DataLayerType

}