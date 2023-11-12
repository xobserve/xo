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

import React from "react"
import {
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    useColorModeValue,
    useToast,
    Text,
    HStack,
    Box,
    Portal
} from "@chakra-ui/react"
import useSession from "hooks/use-session"
import storage from "utils/localStorage"

import { FaRegSun, FaUserAlt, FaSignOutAlt, FaStar, FaSignInAlt, FaFont } from "react-icons/fa"


import { isAdmin } from "types/role"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { localeSetting, locale } from "src/i18n/i18n"
import { useStore } from "@nanostores/react"
import { commonMsg, sidebarMsg } from "src/i18n/locales/en"
import UserSidemenus from "src/components/team/UserSidemenus"
import { ColorModeSwitcher } from "src/components/ColorModeSwitcher"

const UserMenu = ({ miniMode }) => {
    const t = useStore(commonMsg)
    const t1 = useStore(sidebarMsg)
    const { session, logout } = useSession()

    const toast = useToast()
    const navigate = useNavigate()
    const location = useLocation()
    const login = () => {
        storage.set("current-page", location.pathname)
        navigate('/login')
    }

    const changeLang = () => {
        const newLang = locale.get() == "en" ? "zh" : "en"
        localeSetting.set(newLang)

        toast({
            title: newLang == "en" ? "Language changed to English" : "语言已切换为中文",
            status: "success",
            duration: 2000,
            isClosable: true,
        })

        // window.location.reload()
    }

    const isActive = window.location.pathname.startsWith('/account/')
    return (
        <>

            <Menu placement="right">
                {
                    miniMode ?
                        <MenuButton as={IconButton} size="md"
                            fontSize="1em"
                            aria-label=""
                            variant="ghost"
                            color={isActive ? useColorModeValue("brand.500", "brand.200") : "current"}
                            _focus={{ border: null }}
                            className="hover-text"
                            icon={<FaUserAlt />}>
                        </MenuButton>
                        :
                        <MenuButton className="hover-text">
                            <HStack >
                                <FaUserAlt />
                                <Text fontSize="1em">{t1.accountSetting}</Text>
                            </HStack>
                        </MenuButton>
                }
                <Portal>
                    <MenuList zIndex={1000} fontSize="1em">
                        <Link to={session ? `/account/setting` : null}><MenuItem  py="2px" cursor="default" bg="transparent" _hover={{bg: "transparent"}}  icon={<FaUserAlt fontSize="1em" />} >
                            <Text>{session?.user.name ?? "xobserve guest"}</Text>
                            {session && <Text>{session.user.username}</Text>}
                        </MenuItem></Link>
                        <MenuDivider />
                        {session && isAdmin(session.user.role) && <><Link to={`/admin/users`}><MenuItem width="100%" icon={<FaStar fontSize="1em" />} >{t1.adminPanel}</MenuItem></Link></>}
                        {session && <><Link to={`/admin/tenant/users`}><MenuItem width="100%" icon={<FaStar fontSize="1em" />} >{t1.tenantAdmin}</MenuItem></Link><MenuDivider /></>}

                        <MenuItem width="100%"><Box width="100%"><ColorModeSwitcher miniMode={false} /></Box></MenuItem>
                        <MenuItem width="100%" onClick={() => changeLang()} icon={<FaFont fontSize="1em" />}>{t1.currentLang} - {locale.get() == "en" ? "English" : "简体中文"}</MenuItem>
                        {session && <>
                            <MenuItem mt="2px" width="100%">    <UserSidemenus miniMode={false} /></MenuItem>
                            <MenuDivider />
                            <Link to={`/account/setting`}><MenuItem width="100%" icon={<FaRegSun fontSize="1em" />}>{t1.accountSetting}</MenuItem></Link>
                            <MenuItem width="100%" onClick={() => logout()} icon={<FaSignOutAlt fontSize="1em" />}>{t.logout}</MenuItem>
                        </>}
                    </MenuList>
                </Portal>
            </Menu>
            {!session && (miniMode ? <IconButton
                size="md"
                fontSize="1em"
                aria-label=""
                variant="outline"
                color={useColorModeValue("brand.500", "brand.200")}
                _focus={{ border: null }}
                onClick={() => login()}
                icon={<FaSignInAlt />}
            /> :
                <HStack cursor="pointer" onClick={() => login()}>
                    <FaSignInAlt fontSize="1.1em" />
                    <Text fontSize="1em">{t.login}</Text>
                </HStack>)}
        </>
    )
}

export default UserMenu
