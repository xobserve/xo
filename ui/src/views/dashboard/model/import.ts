import {DataSourceSelectItem} from 'src/packages/datav-core/src'

export enum DashboardSource {
    Gcom = 0,
    Json = 1,
}

export enum InputType {
    DataSource = 'datasource',
    Constant = 'constant',
}

export interface DashboardInput {
    name: string;
    label: string;
    info: string;
    value: string;
    type: InputType;
}

export interface DataSourceInput extends DashboardInput {
    pluginId: string;
    options: DataSourceSelectItem[];
}

export interface DashboardInputs {
    dataSources: DataSourceInput[];
    constants: DashboardInput[];
}

export interface ImportDashboardDTO {
    title: string;
    uid: string;
    gnetId: string;
    constants: string[];
    dataSources: DataSourceSelectItem[];
    folder: { id: number; title?: string };
}