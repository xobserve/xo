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

// Display the sidemenus available for current user, including:
// 1. teams which the user is a member of 
// 2. teams whose sidemenu has been set to public

import { Heading, HStack, IconButton, Popover, PopoverBody, PopoverContent, PopoverTrigger,  Text, useToast } from "@chakra-ui/react"
import { useStore } from "@nanostores/react"
import CardSelect, { CardSelectItem } from "components/cards/CardSelect"
import useSession from "hooks/use-session"
import React, { useEffect, useState } from "react"
import { FaAlignLeft } from "react-icons/fa"
import { sidebarMsg } from "src/i18n/locales/en"
import { SideMenu } from "types/teams"
import { requestApi } from "utils/axios/request"

const UserSidemenus = ({miniMode}) => {
    const t1 = useStore(sidebarMsg)
    const toast = useToast()
    const {session} = useSession()
    const [sidemenus, setSidemenus] = useState<SideMenu[]>([])
    useEffect(() => {
        load()
    }, [])

    const load = async () => {
        const res = await requestApi.get("/team/sidemenus/forUser")
        setSidemenus(res.data)
    }

    const selectSidemenu = async (teamId) => {
        if (teamId === session.user.sidemenu) {
            return 
        }
        await requestApi.post(`/team/sidemenu/select/${teamId}`)
        toast({
            title: "Sidemenu selected, reloading...",
            status: "success",
            duration: 3000,
            isClosable: true,
        })
        setTimeout(() => {
            window.location.reload()
        }, 1000)
    }

    return (
        <>
            <Popover trigger="hover" placement="right">
                <PopoverTrigger>
                    <HStack spacing={3} cursor="pointer">
                    {miniMode ? <IconButton
                        size="md"
                        fontSize="1.3rem"
                        aria-label=""
                        variant="ghost"
                        color="current"
                        _focus={{ border: null }}
                        icon={<FaAlignLeft />}
                    /> : <FaAlignLeft fontSize="1rem"/>}
                    {!miniMode && <Text fontSize="1rem">{t1.selectSidemenu}</Text>}
                    </HStack>
               
                </PopoverTrigger>
                <PopoverContent width="fit-content" minWidth="120px" border="null" pl="1">

                    <PopoverBody>
                        <CardSelect title="Select a team sidemenu you want to use">
                            {sidemenus.map(sidemenu => 
                                <CardSelectItem key={sidemenu.teamId} selected={session?.user.sidemenu == sidemenu.teamId} onClick={() => selectSidemenu(sidemenu.teamId)}>
                                    <Heading size='xs' textTransform='uppercase'>
                                        {sidemenu.teamName}
                                    </Heading>
                                    <Text pt='2' fontSize='sm'>
                                        {sidemenu.brief}
                                    </Text>
                                </CardSelectItem>
                            )}
                        </CardSelect>
                    </PopoverBody>
                </PopoverContent>
            </Popover>

        </>
    )
}

export default UserSidemenus