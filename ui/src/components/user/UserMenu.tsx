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

import React from "react"
import {
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    useColorModeValue,
    chakra,
    useToast,
    Text,
    HStack,
    Portal,
    Box
} from "@chakra-ui/react"
import useSession from "hooks/use-session"
import storage from "utils/localStorage"

import { FaRegSun, FaUserAlt, FaSignOutAlt, FaStar, FaSignInAlt, FaFont } from "react-icons/fa"


import { isAdmin } from "types/role"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { localeSetting, locale } from "src/i18n/i18n"
import { useStore } from "@nanostores/react"
import { commonMsg, sidebarMsg } from "src/i18n/locales/en"
import UserSidemenus from "components/team/UserSidemenus"
import { ColorModeSwitcher } from "components/ColorModeSwitcher"

const UserMenu = ({ fontSize = "1.2rem", miniMode }) => {
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
            {session ?
                <Menu placement="right">
                    {
                        miniMode ?
                            <MenuButton as={IconButton} size="md"
                                fontSize={fontSize}
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
                                    <Text fontSize="0.95rem">{t1.accountSetting}</Text>
                                </HStack>
                            </MenuButton>
                    }
                    <Portal>
                        <MenuList>
                            <Link to={`/account/setting`}><MenuItem icon={<FaUserAlt fontSize="1rem" />} >
                                <Text>{session.user.name}</Text>
                                <Text textStyle="annotation">{session.user.username}</Text>
                            </MenuItem></Link>
                            <MenuDivider />
                            {isAdmin(session.user.role) && <><Link to={`/admin/users`}><MenuItem icon={<FaStar fontSize="1rem" />} >{t1.adminPanel}</MenuItem></Link><MenuDivider /></>}
                            <MenuItem><Box><ColorModeSwitcher miniMode={false} /></Box></MenuItem>
                            <MenuItem onClick={() => changeLang()} icon={<FaFont fontSize="1rem" />}>{t1.currentLang} - {locale.get() == "en" ? "English" : "简体中文"}</MenuItem>
                            <MenuItem mt="2px" >    <UserSidemenus miniMode={false} /></MenuItem>
                            <MenuDivider />
                            <Link to={`/account/setting`}><MenuItem icon={<FaRegSun fontSize="1rem" />}>{t1.accountSetting}</MenuItem></Link>
                            <MenuItem onClick={() => logout()} icon={<FaSignOutAlt fontSize="1rem" />}>{t.logout}</MenuItem>

                        </MenuList>
                    </Portal>
                </Menu> :
                (miniMode ? <IconButton
                    size="md"
                    fontSize={fontSize}
                    aria-label=""
                    variant="ghost"
                    color={isActive ? useColorModeValue("brand.500", "brand.200") : "current"}
                    _focus={{ border: null }}
                    onClick={() => login()}
                    icon={<FaSignInAlt />}
                /> :
                    <HStack cursor="pointer" onClick={() => login()}>
                        <FaSignInAlt fontSize="1.1rem" />
                        <Text fontSize="0.95rem">{t.login}</Text>
                    </HStack>)

            }
        </>
    )
}

export default UserMenu
