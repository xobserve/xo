import { DataSourceInstanceSettings, ThemeType,DataSourcePluginMeta,CommonConfig, GrafanaTheme, GrafanaTheme2} from '../types'
import { History as RouterHistory } from 'history';
import _ from 'lodash'

// boot configs ,loaded from backend 
export interface BootConfig {
    common:CommonConfig
    datasourceMetas: {string:DataSourcePluginMeta}
    datasources: {string:DataSourceInstanceSettings}
    panels:{string: any}
    sidemenu: any[]
    theme: GrafanaTheme
    theme2: GrafanaTheme2
}

let bootConfig:BootConfig = null
export const setBootConfig = (config:BootConfig) => {
    bootConfig = config
}
export const getBootConfig = () => {
    return bootConfig
}
export const getDefaultDatasourceName = () => {
    let name = null
    _.forEach(bootConfig.datasources, (ds,n) => {
        if (ds.isDefault) {
            name = n
        }
    })
    
    return name
}

// colors for dynamic theme, used in inline css styles
// @todo : need to be loaded from backend
export const colorConfig = {
    light: {
        componentBG: '#fff'
    },
    dark: {
        componentBG: '#141619'
    }
}

export const getColorFromConfig = (theme: ThemeType, name:string) => {
    return colorConfig[theme][name]
}


// global react router used to goto a url
// sometimes we cant get withRouter props
let history:RouterHistory;
export const setHistory = (h) => {
    history = h
}
export const getHistory = () => {
    return history
}

export let currentTheme : ThemeType = ThemeType.Light

export const setCurrentTheme = (tt: ThemeType) => {
    currentTheme = tt
}

export let localeData;
export const setLocaleData = (data) => {
    localeData = data
}


// lang
export let currentLang  = 'en_US'
export const setCurrentLang = (lang: string) => {
    currentLang = lang
}


//@legacy
// config examples, remove in future
export const config = {
    officialWebsite: 'https://datav.dev',
    baseUrl: `http://${window.location.hostname}:9085/`,
    appSubUrl: '/',
    minRefreshInterval: '5s',
    exploreEnabled: true,
    viewersCanEdit: false,
    defaultDatasource: 'Prometheus',
    disableSanitizeHtml: false,
    rootFolderName: 'General',
    panel: { newTitle: 'Panel Title' },
    dashboard: { newTitle: 'New Dashboard Copy' },
    defaultAdminName: 'admin',
    
    alertingEnabled: true,
    alertingErrorOrTimeout: 'alerting',
    alertingNoDataOrNullValues: 'no_data',
    alertingMinInterval: 1,

    rendererAvailable: false,
    
    application: {
        startDate: () => 'now-3h',
        endDate: () => 'now',
        theme: ThemeType.Light,
        locale: 'en_US'
    },

    user: {
        lightTheme: true
    },
    timePicker: {
        time : {from: "now-1h", to: "now"},
        refresh: '',
        timezone: 'browser'
    },
    featureToggles:  {
        transformations: false,
        expressions: false,
        newEdit: false,
        meta: false,
        newVariables: true,
    },
    buildInfo: {
        buildstamp: 1592571942,
        commit: "",
        edition: "Open Source",
        env: "development",
        hasUpdate: false,
        isEnterprise: false,
        latestVersion: "0.8.0",
        version: "0.8.0",
    },
    licenseInfo: {
        expiry: 0,
        hasLicense: false,
        licenseUrl: "/admin/upgrading",
        stateInfo: "",
    }
}