// Copyright 2023 Datav.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { Box, Tooltip, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaTv } from "react-icons/fa";
import { useKey } from "react-use";
import { FullscreenEvent } from "src/data/bus-events";
import { FullscreenKey } from "src/data/storage-keys";
import { dispatch } from "use-bus";
import storage from "utils/localStorage";
import React from "react"
import { useStore } from "@nanostores/react";
import { dashboardMsg } from "src/i18n/locales/en";

const Fullscreen = () => {
    const t1 = useStore(dashboardMsg)
    const toast = useToast()
    const [fullscreen, setFullscreen] = useState(storage.get(FullscreenKey)??false)

    useKey("Escape", () => onFullscreenChange(true))

    useEffect(() => {
        if (fullscreen) {
            toast({
                description: t1.exitFullscreenTips,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        }
        dispatch({ type: FullscreenEvent, data: fullscreen })
        storage.set(FullscreenKey, fullscreen)
    },[fullscreen])

    const onFullscreenChange = (isExit?) => {
        setFullscreen(f => {
            if (isExit) {
                if (f == false) {
                    return  false
                }
            }

            return !f
        })
    }

    return (
        <Tooltip label={t1.fullscreenTips}><Box onClick={() =>onFullscreenChange(false)} cursor="pointer"><FaTv /></Box></Tooltip>
    )
}

export default Fullscreen;