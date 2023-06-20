// Even if fetch nothing from datasource, we still need to show the allowed panels

import { PanelType } from "types/dashboard";

export const panelsAllowNoData = [PanelType.Echarts, PanelType.Text]