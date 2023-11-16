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

import { Flex, Heading, HStack, IconButton, Popover, PopoverBody, PopoverContent, PopoverTrigger, Portal, Text, useMediaQuery, useToast } from "@chakra-ui/react"
import { useStore } from "@nanostores/react"
import CardSelect, { CardSelectItem } from "src/components/cards/CardSelect"
import useSession from "hooks/use-session"
import React, { useEffect, useState } from "react"
import { FaAlignLeft } from "react-icons/fa"
import { MobileVerticalBreakpoint } from "src/data/constants"
import { sidebarMsg } from "src/i18n/locales/en"
import { requestApi } from "utils/axios/request"
import { Tenant } from "types/tenant"
import { useParams } from "react-router-dom"
import { $config } from "src/data/configs/config"
import { selectTenant } from "utils/tenant"

const SelectUserTenant = ({ miniMode }) => {
    const t1 = useStore(sidebarMsg)
    const toast = useToast()
    const config = useStore($config)
    const { session } = useSession()
    const [tenants, setTenants] = useState<Tenant[]>([])
    const teamId = useParams().teamId
    useEffect(() => {
        if (session) {
            load()
        }
    }, [session])

    const load = async () => {
        const res = await requestApi.get(`/tenant/user/in/${session.user.id}`)
        setTenants(res.data)
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
                        /> : <FaAlignLeft fontSize="1em" />}
                        {!miniMode && <Text fontSize="1em">{t1.selectTenant} - {tenants.find(t => t.id == config.currentTenant)?.name}</Text>}
                    </HStack>

                </PopoverTrigger>
                <Portal>
                    <PopoverContent width="fit-content" minWidth="120px" border="null" pl="1">
                        <PopoverBody>
                            <CardSelect title="">
                                {tenants.map(tenant =>
                                    <CardSelectItem key={tenant.id} selected={config.currentTenant == tenant.id} onClick={() => selectTenant(tenant.id, teamId, config, toast)}>
                                        <Flex width="200px" alignItems="center" fontSize="1em" fontWeight="550" px="2" py="1" justifyContent="space-between">
                                            <Text  >
                                                {tenant.name}
                                            </Text>
                                            <Text opacity={0.7} fontWeight={400}>
                                                {tenant.numTeams} teams
                                            </Text>
                                        </Flex>
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

export default SelectUserTenant