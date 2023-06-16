import { useState } from "react"
import { MiniSidemenuEvent } from "src/data/bus-events"
import { SidemenuMinimodeKey } from "src/data/storage-keys"
import useBus from "use-bus"
import storage from "utils/localStorage"

// listening for the event of mini sidemenu
const useMiniMode = () => {
    const [miniMode, setMiniMode] = useState(storage.get(SidemenuMinimodeKey)??true)

    useBus(
        (e) => { return e.type == MiniSidemenuEvent },
        (e) => {
            setMiniMode(e.data)
        }
    )

    return miniMode
}

export default useMiniMode