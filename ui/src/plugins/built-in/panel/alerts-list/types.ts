export interface AlertsListOptions {
  maxItems: number
  sortOrder: number
  filter : {
    onlyAlertsOnDashboard: boolean
    alertName: string 
    teams: number[]
    ok:boolean
    alerting: boolean
  }
}
