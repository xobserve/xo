import { DatasourceType, PanelType } from "types/dashboard"

//@needs-update-when-add-new-panel
export const supportDatasources = {
    [PanelType.Graph]: [DatasourceType.Prometheus, DatasourceType.TestData,DatasourceType.ExternalHttp],
    [PanelType.Table]: [DatasourceType.Prometheus, DatasourceType.TestData,DatasourceType.ExternalHttp],
    [PanelType.NodeGraph]: [DatasourceType.TestData,DatasourceType.ExternalHttp,DatasourceType.Jaeger],
    [PanelType.Text]: [],
    [PanelType.Echarts]: [DatasourceType.Prometheus, DatasourceType.TestData,DatasourceType.ExternalHttp]
}

