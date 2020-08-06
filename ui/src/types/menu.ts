import { Role } from "./acl";

export interface MenuItem {
    id?: string;
    parentID?: string;
    url?: string; // when url set to null, children will have their own direct url to accsess
    title?: any;
    subTitle?: any;
    icon?: string;
    img?: string;
    showPosition?: MenuPosition;
    redirectTo?: string; //can be 3 types,  1. undefined: access MenuItem's url 2. null: MenuItem can't be clicked 3. a real url string, click MenuItem ,will access this url
    children?: MenuItem[];
    breadcrumbs?: any[];
    component?: any;
    active?: boolean;
    hideFromTabs?: boolean;
    needRole?: Role; // if user wants to see this menu item, his role must be greater than this
    exact?: boolean

    // for team menu items setting
    key?: string;
    level?: number;
    disabled?: boolean
}

export enum MenuPosition {
    Top = 'top',
    Bottom = 'bottom',
}

export interface SideMenu {
    id: number
    teamId : number
    teamName? : string
    desc? : string
    data: MenuItem[]
}