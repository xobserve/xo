export interface BarSeries {
    name: string
    rawName: string
    color?: string
    timestamps?: number[]
    values?: number[]
}

export enum BarThresholdArrow {
    Circle = 'circle',
    Rect = 'rect',
    RoundRect =  'roundRect',
    Triangle =  'triangle' ,
    Diamond =  'diamond' ,
    Pin =  'pin' ,
    Arrow =  'arrow' ,
    None =  'none'
}