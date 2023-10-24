import moment from "moment"
import { dateTimeFormat } from "utils/datetime/formatter"

export const formatLogTimestamp = (ts: number, isMobileScreen = false) => {
    return isMobileScreen ? moment(ts / 1e6).format("MM-DD hh:mm:ss") : dateTimeFormat(ts / 1e6, { format: "YY-MM-DD HH:mm:ss.SSS" })
}