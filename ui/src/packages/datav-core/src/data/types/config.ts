export interface DatavConfig {
  panel: PanelConfig
  dashboard: DashboardConfig,
  application: ApplicationConfig,
  user : UserConfig
}

export interface PanelConfig {
  newTitle: string
}

export interface DashboardConfig {
  newTitle: string
}

export interface ApplicationConfig {
  startDate: any ,
  endDate: any,
  theme: string,
  locale: string
}

export interface UserConfig {
  avatarUrl?: string
}