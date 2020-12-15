export interface AlertsListOptions {
  maxItems: number
  sortOrder: number
  filter : {
    dahUID: string 
    teams: number[]
    ok:boolean
    alerting: boolean
  }
}
