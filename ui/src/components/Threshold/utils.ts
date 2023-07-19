import { ThresholdsConfig } from "types/threshold";

export const getThreshold = (value:number, thresholds: ThresholdsConfig, max?:number) => {
    let t;
    if (thresholds.mode == 'absolute') {
        t = thresholds.thresholds.find(s => s.value <= value)
    } else {
        if (max == undefined || max == null) {
            console.error("max is required when thresholds mode is percentage")
            return null
        }

        const percentage = value / max * 100
        t = thresholds.thresholds.find(s => s.value <= percentage)
    }

    if (!t && thresholds.thresholds.length > 0) {
        // use base one
        t = thresholds.thresholds[thresholds.thresholds.length - 1]
    }

    return t
}