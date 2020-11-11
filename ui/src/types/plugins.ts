import { PanelPlugin } from 'src/packages/datav-core/src';


export interface PluginDashboard {
  dashboardId: number;
  description: string;
  folderId: number;
  imported: boolean;
  importedRevision: number;
  importedUri: string;
  importedUrl: string;
  path: string;
  pluginId: string;
  removed: boolean;
  revision: number;
  slug: string;
  title: string;
}

export interface PanelPluginsIndex {
  [id: string]: PanelPlugin;
}


export interface VariableQueryProps {
  query: any;
  onChange: (query: any, definition: string) => void;
  datasource: any;
  templateSrv: any;
}
