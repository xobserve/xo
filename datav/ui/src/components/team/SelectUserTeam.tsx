// Copyright 2023 xObserve.io Team
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

// Display the sidemenus available for current user, including:
// 1. teams which the user is a member of 
// 2. teams whose sidemenu has been set to public

import { Heading, HStack, IconButton, Popover, PopoverBody, PopoverContent, PopoverTrigger,  Portal,  Text, useMediaQuery, useToast } from "@chakra-ui/react"
import { useStore } from "@nanostores/react"
import CardSelect, { CardSelectItem } from "src/components/cards/CardSelect"
import useSession from "hooks/use-session"
import React, { useEffect, useState } from "react"
import { FaAlignLeft } from "react-icons/fa"
import { MobileVerticalBreakpoint } from "src/data/constants"
import { sidebarMsg } from "src/i18n/locales/en"
import {  Team } from "types/teams"
import { requestApi } from "utils/axios/request"

const SelectUserTeam = ({miniMode}) => {
    const t1 = useStore(sidebarMsg)
    const toast = useToast()
    const {session} = useSession()
    const [teams, setTeams] = useState<Team[]>([])
    useEffect(() => {
        load()
    }, [])

    const load = async () => {
        const res = await requestApi.get("/team/for/user")
        setTeams(res.data)
    }

    const selectTeam = async (teamId) => {
        if (teamId === session.user.currentTeam) {
            return 
        }
        await requestApi.post(`/team/select/${teamId}`)
        toast({
            title: "Team selected, reloading...",
            status: "success",
            duration: 3000,
            isClosable: true,
        })
        setTimeout(() => {
            window.location.reload()
        }, 1000)
    }

    const [isMobileScreen] = useMediaQuery(MobileVerticalBreakpoint)
    return (
        <>
            <Popover trigger={isMobileScreen ? "click" : "hover"} placement="right">
                <PopoverTrigger>
                    <HStack spacing={3} cursor="pointer" width="100%">
                    {miniMode ? <IconButton
                        size="md"
                        fontSize="1.3em"
                        aria-label=""
                        variant="ghost"
                        color="current"
                        _focus={{ border: null }}
                        icon={<FaAlignLeft />}
                    /> : <FaAlignLeft fontSize="1em"/>}
                    {!miniMode && <Text fontSize="1em">{t1.selectTeam}</Text>}
                    </HStack>
               
                </PopoverTrigger>
                <Portal>
                <PopoverContent width="fit-content" minWidth="120px" border="null" pl="1">

                    <PopoverBody>
                        <CardSelect title={t1.selectTeamTips}>
                            {teams.map(team => 
                                <CardSelectItem key={team.id} selected={session?.user.currentTeam == team.id} onClick={() => selectTeam(team.id)}>
                                    <Text fontSize="1em" fontWeight="550">
                                        {team.name}
                                    </Text>
                                    <Text pt='1' fontSize='0.9em'>
                                        {team.brief}
                                    </Text>
                                </CardSelectItem>
                            )}
                        </CardSelect>
                    </PopoverBody>
                </PopoverContent>
                </Portal>
            </Popover>

        </>
    )
}

export default SelectUserTeam