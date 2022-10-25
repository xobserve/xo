import React from "react"
import {
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    useColorModeValue,
    chakra
} from "@chakra-ui/react"
import useSession from "hooks/use-session"
import { useRouter } from "next/router"
import storage from "utils/localStorage"

import { FaRegSun, FaUserAlt, FaSignOutAlt, FaStar, FaSignInAlt } from "react-icons/fa"


import Link from "next/link"
import { isAdmin } from "types/role"

const UserMenu = ({fontSize="1.2rem"}) => {
    const { session, logout } = useSession()
    const router = useRouter()



    const login = () => {
        storage.set("current-page", router.asPath)
        router.push('/login')
    }

    const isActive = window.location.pathname.startsWith('/account/')
    return (
        <>
            {session ?
                <Menu placement="right">
                    <MenuButton>
                     <IconButton
                        size="md"
                        fontSize={fontSize}
                        aria-label=""
                        variant="ghost"
                        color={isActive ? useColorModeValue("brand.500","brand.200") : "current"}
                        _focus={{ border: null }}
                        icon={<FaUserAlt />}
                        />
                        </MenuButton>
                    <MenuList>
                        <MenuItem icon={<FaUserAlt fontSize="1rem" />} >
                            <span>{session.user.name}</span>
                            <chakra.span ml="2" layerStyle="textSecondary">{session.user.username}</chakra.span>
                        </MenuItem>
                        <MenuDivider />
                        {isAdmin(session.user.role) && <><Link href={`/admin`}><MenuItem icon={<FaStar fontSize="1rem" />} >Admin Panel</MenuItem></Link><MenuDivider /></>}

                        <Link href={`/account/setting`}><MenuItem icon={<FaRegSun fontSize="1rem" />}>Account Setting</MenuItem></Link>
                        <MenuItem onClick={() => logout()} icon={<FaSignOutAlt fontSize="1rem" />}>Log out</MenuItem>
                    </MenuList>
                </Menu> :
                 <IconButton
                 size="md"
                 fontSize={fontSize}
                 aria-label=""
                 variant="ghost"
                 color={isActive ? useColorModeValue("brand.500","brand.200") : "current"}
                 _focus={{ border: null }}
                 onClick={() => login()}
                 icon={<FaSignInAlt />}
                 />
            }
        </>
    )
}

export default UserMenu
