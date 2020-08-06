import { PanelPlugin } from "src/packages/datav-core";

export interface DashboardDTO {
    redirectUri?: string;
    dashboard: DashboardDataDTO;
    meta: DashboardMeta;
  }

  export interface DashboardDataDTO {
    title: string;
  }
  

  export interface DashboardMeta {
    canSave?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    canShare?: boolean;
    canStar?: boolean;
    canAdmin?: boolean;
    url?: string;
    folderId?: number;
    fromExplore?: boolean;
    canMakeEditable?: boolean;
    submenuEnabled?: boolean;
    provisioned?: boolean;
    provisionedExternalId?: string;
    focusPanelId?: number;
    isStarred?: boolean;
    showSettings?: boolean;
    expires?: string;
    isSnapshot?: boolean;
    folderTitle?: string;
    folderUrl?: string;
    created?: string;
    createdBy?: string;
    updated?: string;
    updatedBy?: string;
    ownedBy?: number
  }
  
  export interface PanelState {
    pluginId: string;
    plugin?: PanelPlugin;
  }

  export enum DashboardInitPhase {
    NotStarted = 'Not started',
    Fetching = 'Fetching',
    Services = 'Services',
    Failed = 'Failed',
    Completed = 'Completed',
  }
  