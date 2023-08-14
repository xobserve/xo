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
import {
  Box,
  Flex,
  HStack,
  Text,
  IconButton,
  useColorModeValue,
  VStack,
  Divider,
  useToast,
} from "@chakra-ui/react"
import Logo from "components/Logo"
import React, { useEffect, useMemo, useState } from "react"
import { measureText } from "utils/measureText"
import * as Icons from "react-icons/fa"
import { concat } from "lodash"
import { ColorModeSwitcher } from "components/ColorModeSwitcher"
import { requestApi } from "utils/axios/request"
import { useStore } from "@nanostores/react"
import { commonMsg, sidebarMsg } from "src/i18n/locales/en"
import useSession from "hooks/use-session"
import useFullscreen from "hooks/useFullscreen"
import { Route } from "types/route"
import { Link, useLocation } from "react-router-dom"
import storage from "utils/localStorage"
import { SidemenuMinimodeKey } from "src/data/storage-keys"
import ReserveUrls from "src/data/reserve-urls"
import UserMenu from "components/user/UserMenu"
import { config } from "src/data/configs/config"
import { isEmpty } from "utils/validate"
import Search from "src/views/search/Search"
import { Session } from "types/user"
import PopoverTooltip from "components/PopoverTooltip"
import { HomeDashboardId } from "src/data/dashboard"

const miniWidth = 65
const navSize = 16
const maxNavSize = 200

interface Props {
  children: any
  sidemenu: any[]
  session: Session
}

const PageContainer = (props) => {
  const toast = useToast()
  const { session } = useSession()
  const [sidemenu, setSidemenu] = useState<Route[]>(null)
  useEffect(() => {
    if (session) {
      loadSidemenu()
    } else {
      setSidemenu([])
    }

  }, [session])

  const loadSidemenu = async () => {
    const res = await requestApi.get(`/team/sidemenu/${session.user.sidemenu}`)
    if (!res?.data) {
      toast({
        title: "Failed to load current team's sidemenu, try to select another team's sidemenu",
        status: "error",
        duration: 5000,
      })
        return 
    }
    setSidemenu(res.data.data.filter((item) => !item.hidden))
  }

  return (sidemenu && <Container {...props} sidemenu={sidemenu} session={session} />)
}

export default PageContainer
const Container = ({ children, sidemenu, session }: Props) => {
  const { pathname: asPath } = useLocation()
  const t = useStore(commonMsg)
  const t1 = useStore(sidebarMsg)

  const [miniMode, setMiniMode] = useState(storage.get(SidemenuMinimodeKey) ?? true)
  const fullscreen = useFullscreen()


  const onMinimodeChange = () => {
    setMiniMode(!miniMode);
    storage.set(SidemenuMinimodeKey, !miniMode)
  }

  const bottomNavs = [
    { title: t.new, icon: "FaPlus", url: `${ReserveUrls.New}/dashboard`, isActive: asPath.startsWith(ReserveUrls.New) },
    { title: t.configuration, icon: "FaCog", url: `${ReserveUrls.Config}/datasources`, isActive: asPath.startsWith(ReserveUrls.Config) },
    config.showAlertIcon && { title: t.alert, icon: "FaBell", url: `${ReserveUrls.Alerts}`, isActive: asPath.startsWith(ReserveUrls.Alerts) },
    { title: t1.search, icon: "FaSearch", url: `${ReserveUrls.Search}`, isActive: asPath.startsWith(ReserveUrls.Search) },
  ]

  const paddingLeft = 16
  const paddingRight = 16
  const childMarginLeft = 24
  const navWidth = useMemo(() => {
    let navWidth = 0

    if (!miniMode) {
      concat(sidemenu, bottomNavs).forEach(nav => {
        // text width + margin + icon width + padding
        const width = measureText(nav.title, navSize).width + 10 + 16 + paddingLeft + paddingRight
        if (width > navWidth) {
          navWidth = width
        }
        if (nav.children) {
          nav.children.forEach(child => {
            // text width   + child margin left + padding 
            const width = measureText(child.title, navSize).width + childMarginLeft + + paddingLeft + paddingRight + 6
            if (width > navWidth) {
              navWidth = width
            }
          }
          )
        }
      })
    }

    if (navWidth > maxNavSize) {
      navWidth = maxNavSize
    }

    return navWidth
  }, [sidemenu, miniMode, bottomNavs])

  const sideWidth = fullscreen ? 0 : (miniMode ? miniWidth : navWidth)
  const textColor = useColorModeValue("gray.500", "whiteAlpha.800")

  return (
    <HStack id="page-container" width="100%" alignItems="top">
      <Flex
        display={fullscreen ? "none" : "flex"}
        flexDir="column" pl={paddingLeft + 'px'}
        pr={paddingRight + 'px'}
        justifyContent="space-between"
        id="sidemenu"
        position="fixed"
        top="0"
        left="0"
        bottom="0"
        width={sideWidth + 'px'}
        transition="all 0.2s"
        height="100vh"
        className="bordered-right"
      >
        <Flex id="sidemenu-top" flexDir="column" alignItems={(miniMode || isEmpty(sidemenu)) ? "center" : "left"}>
          {(miniMode || isEmpty(sidemenu)) ?
            <Box cursor="pointer" onClick={onMinimodeChange} mt="2"><Logo /></Box>
            :
            <Box cursor="pointer" onClick={onMinimodeChange} opacity="0.2" position="absolute" right="1px" top="14px" className="hover-text" p="1" fontSize="0.7rem"><Icons.FaChevronLeft /></Box>
          }
          {sidemenu.map((link, index) => {
            return <Box key={link.url} mt={miniMode ? 2 : 3}>
              <Box>
                <NavItem isActive={miniMode ? asPath.startsWith(link.url) : asPath == link.url} key={index} text={link.title} icon={link.icon} miniMode={miniMode} fontWeight={500} url={link.children?.length > 0 ? link.children[0].url : link.url} children={link.children}/>
              </Box>
              {
                !miniMode && link.children && link.children.map((child, index) => {
                  return <Box mt="5px" ml={childMarginLeft + 'px'}><NavItem isActive={asPath == child.url} key={index} text={child.title} miniMode={miniMode} fontSize={navSize} url={child.url} /></Box>
                })
              }
            </Box>
          })}
        
          {session && !sidemenu.some(nav => nav.dashboardId != HomeDashboardId) &&  <>
            <Divider mt={miniMode ? 2 : 3} />
            <Box mt={miniMode ? 2 : 3}><NavItem fontSize={navSize-1} text={t1.newItem} url={`/cfg/team/${session.user.sidemenu}/sidemenu`} miniMode={miniMode} icon="FaPlus" /></Box>
          </>}
        </Flex>
        <Flex id="sidemenu-bottom" flexDir="column" pb="2" alignItems={miniMode ? "center" : "left"} color={textColor}>
          <VStack alignItems="left" spacing={miniMode ? 1 : 3}>
            {bottomNavs.map((nav, index) => {
              if (nav.url == ReserveUrls.Search) {
                return <Search key={nav.url} title={nav.title} miniMode={miniMode} sideWidth={sideWidth} />
              } else {
                return <Box  key={nav.url}><NavItem isActive={nav.isActive} text={nav.title} icon={nav.icon} miniMode={miniMode} url={nav.url} /></Box>
              }
            })}

            <Divider />
            {/* <Box color={textColor}><ColorModeSwitcher miniMode={miniMode} /></Box> */}
            {!isEmpty(config.repoUrl) && <Box><NavItem text="Github" icon="FaGithub" miniMode={miniMode} url={config.repoUrl} /></Box>}
            <UserMenu miniMode={miniMode} />
          </VStack>

        </Flex>
      </Flex>
      <Box id="main-container" transition="all 0.2s" width={`calc(100% - ${sideWidth}px)`} ml={sideWidth + 'px'}>
        {React.cloneElement(children, { sideWidth })}
      </Box>
    </HStack>)
}



const NavItem = ({ text, icon = null, miniMode, fontWeight = 400, fontSize = navSize, url, isActive = false, children = null }) => {
  const Icon = Icons[icon]
  const textColor = useColorModeValue("gray.500", "whiteAlpha.800")
  const { pathname: asPath } = useLocation()
  return (
    <PopoverTooltip
      trigger={miniMode ? "hover" : null}
      offset={[0, 14]}
      triggerComponent={<Box>
        <Link to={url}>
          <HStack color={isActive ? useColorModeValue("brand.500", "brand.200") : useColorModeValue("gray.500", "whiteAlpha.800")} className="hover-text" cursor="pointer">
            {icon && <Box>
              {miniMode ?
                <IconButton fontSize={"1.2rem"} aria-label="" variant="ghost" color="current" _focus={{ border: null }} icon={<Icon />} />
                : <Icon />
              }
            </Box>}
            {!miniMode && <Text fontSize={`${fontSize}px`} fontWeight={fontWeight} >{text}</Text>}
          </HStack>
        </Link>
      </Box>}
      showHeaderBorder={children?.length > 0}
      headerComponent={<Link to={children?.length > 0 ? children[0].url : url}>{text}</Link>}
      bodyComponent={children?.length > 0 && <VStack alignItems="left" spacing="3" py="2">
        {children?.length > 0 && children.map(subLink =>
          <Link to={subLink.url} key={subLink.url}>
            <Text color={asPath == subLink.url ? useColorModeValue("brand.500", "brand.200") : textColor}>{subLink.title}</Text>
          </Link>
        )}
      </VStack>}
    />
  )
}

