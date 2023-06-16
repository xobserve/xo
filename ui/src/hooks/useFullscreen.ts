import { useState } from "react"
import { FullscreenEvent } from "src/data/bus-events"
import { FullscreenKey } from "src/data/storage-keys"
import useBus from "use-bus"
import storage from "utils/localStorage"

// listening for the event of entering fullscreen
const useFullscreen = () => {
    const [fullscreen, setFullscreen] = useState(storage.get(FullscreenKey)??false)

    useBus(
        (e) => { return e.type == FullscreenEvent },
        (e) => {
            setFullscreen(e.data)
        }
    )

    return fullscreen
}

export default useFullscreen