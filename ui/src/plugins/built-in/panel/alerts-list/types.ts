export interface AlertsListOptions {
  maxItems: number
  sortOrder: number
  currentTimeRange: boolean
  teams: number[]
  dahUID: string 
  filter : {

    ok:boolean
    alerting: boolean
  }
}
