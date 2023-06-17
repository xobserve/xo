import { DatasourceType, PanelType } from "types/dashboard"

export const supportDatasources = {
    [PanelType.Graph]: [DatasourceType.Prometheus, DatasourceType.TestData,DatasourceType.ExternalHttp],
    [PanelType.Table]: [DatasourceType.Prometheus, DatasourceType.TestData,DatasourceType.ExternalHttp],
    [PanelType.NodeGraph]: [DatasourceType.TestData,DatasourceType.ExternalHttp,DatasourceType.Jaeger],
    [PanelType.Text]: [],
}

