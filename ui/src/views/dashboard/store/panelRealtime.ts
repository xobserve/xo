import { first, last } from 'lodash'
import { map } from 'nanostores'
export const $realPanelTime = map({} as any)



export const PanelRealTimeStorageKey = "panel-real-time"

// timeline: timestamp array, in seconds
export const setPanelRealTime = (panelId: number, timeline: number[]) => {
    $realPanelTime.setKey(panelId.toString(), [first(timeline), last(timeline)])
}

export const clearPanelRealTime = () => {
    $realPanelTime.set({})
}

export const getPanelRealTime = (panelId:number) => {
    return $realPanelTime.get()[panelId]
}