import useBus from "use-bus"

const receivedEvents = new Set()




// receive events , filter out the duplicated ones
// expires:  continue to receive events after this time, in milliseconds
export const useDedupEvent = (event:string, callback, expires=500) => {
    useBus(
        (e) => { return e.type == event },
        (e) => {
            if (!receivedEvents.has(e.type)) {
                callback()
                receivedEvents.add(e.type)
                setTimeout(() => {
                    receivedEvents.delete(e.type)
                }, expires)
            }
        }
    )
}
