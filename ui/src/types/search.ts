export interface DashboardSearchHit extends DashboardSectionItem, DashboardSection {}

export interface DashboardSectionItem {
    checked?: boolean;
    folderId?: number;
    folderTitle?: string;
    folderUid?: string;
    folderUrl?: string;
    id: number;
    isStarred: boolean;
    selected?: boolean;
    tags: string[];
    title: string;
    type: DashboardSearchItemType;
    uid?: string;
    uri: string;
    url: string;
  }

  export enum DashboardSearchItemType {
    DashDB = 'dash-db',
    DashHome = 'dash-home',
    DashFolder = 'dash-folder',
  }
  
  export interface DashboardSection {
    id: number;
    uid?: string;
    title: string;
    expanded?: boolean;
    url: string;
    icon?: string;
    score?: number;
    checked?: boolean;
    items: DashboardSectionItem[];
    toggle?: (section: DashboardSection) => Promise<DashboardSection>;
    selected?: boolean;
    type: DashboardSearchItemType;
    slug?: string;
    itemsFetching?: boolean;
  }