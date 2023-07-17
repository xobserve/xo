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
    useToast
} from "@chakra-ui/react"
import useSession from "hooks/use-session"
import storage from "utils/localStorage"

import { FaRegSun, FaUserAlt, FaSignOutAlt, FaStar, FaSignInAlt, FaFont } from "react-icons/fa"


import { isAdmin } from "types/role"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { localeSetting,locale } from "src/i18n/i18n"
import { useStore } from "@nanostores/react"
import { commonMsg, sidebarMsg } from "src/i18n/locales/en"

const UserMenu = ({ fontSize = "1.2rem" }) => {
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
                    <MenuButton as={IconButton} size="md"
                        fontSize={fontSize}
                        aria-label=""
                        variant="ghost"
                        color={isActive ? useColorModeValue("brand.500", "brand.200") : "current"}
                        _focus={{ border: null }}
                        icon={<FaUserAlt />}>
                    </MenuButton>
                    <MenuList>
                        <MenuItem icon={<FaUserAlt fontSize="1rem" />} >
                            <span>{session.user.name}</span>
                            <chakra.span ml="2" layerStyle="textSecondary">{session.user.username}</chakra.span>
                        </MenuItem>
                        <MenuDivider />
                        {isAdmin(session.user.role) && <><Link to={`/admin`}><MenuItem icon={<FaStar fontSize="1rem" />} >{t1.adminPanel}</MenuItem></Link><MenuDivider /></>}
                        <MenuItem onClick={() => changeLang()} icon={<FaFont fontSize="1rem" />}>{t1.currentLang} - {locale.get() == "en" ? "English" : "简体中文"}</MenuItem>
                        <Link to={`/account/setting`}><MenuItem icon={<FaRegSun fontSize="1rem" />}>{t1.accountSetting}</MenuItem></Link>
                        <MenuItem onClick={() => logout()} icon={<FaSignOutAlt fontSize="1rem" />}>{t.logout}</MenuItem>

                    </MenuList>
                </Menu> :
                <IconButton
                    size="md"
                    fontSize={fontSize}
                    aria-label=""
                    variant="ghost"
                    color={isActive ? useColorModeValue("brand.500", "brand.200") : "current"}
                    _focus={{ border: null }}
                    onClick={() => login()}
                    icon={<FaSignInAlt />}
                />
            }
        </>
    )
}

export default UserMenu
