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
  useMediaQuery,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
} from "@chakra-ui/react"
import Logo from "src/components/Logo"
import React, { useMemo, useState } from "react"
import { measureText } from "utils/measureText"
import * as Icons from "react-icons/fa"
import { cloneDeep, concat, isArray } from "lodash"
import { useStore } from "@nanostores/react"
import { commonMsg, sidebarMsg } from "src/i18n/locales/en"
import useSession from "hooks/use-session"
import useFullscreen from "hooks/useFullscreen"
import { Link, useLocation } from "react-router-dom"
import storage from "utils/localStorage"
import { SidemenuMinimodeKey } from "src/data/storage-keys"
import ReserveUrls from "src/data/reserve-urls"
import UserMenu from "src/components/user/UserMenu"
import { $config, UIConfig } from "src/data/configs/config"
import { isEmpty } from "utils/validate"
import Search from "src/views/search/Search"
import PopoverTooltip from "src/components/PopoverTooltip"
import { HomeDashboardId } from "src/data/dashboard"

import { useNavigate } from "react-router-dom"
import { MobileBreakpoint } from "src/data/constants"
import { HamburgerIcon } from "@chakra-ui/icons"
import CustomScrollbar from "src/components/CustomScrollbar/CustomScrollbar"
import { locale } from "src/i18n/i18n"
export let gnavigate


const maxNavSize = 160
const minNavSize = 100
interface Props {
  children: any
  sidemenu: any[]
  config: UIConfig
}

const PageContainer = (props) => {
  gnavigate = useNavigate()
  return (<Container {...props} />)
}

export default PageContainer

const Container = (props: Props) => {
  const { children } = props
  const config = useStore($config)
  const sidemenu = cloneDeep(config.sidemenu)
  const { session } = useSession()
  const { pathname: asPath } = useLocation()
  const t = useStore(commonMsg)
  const t1 = useStore(sidebarMsg)
  let code = useStore(locale)
  const [miniMode, setMiniMode] = useState(storage.get(SidemenuMinimodeKey) ?? true)
  const fullscreen = useFullscreen()
  
  sidemenu?.forEach(nav => {
    try {
      const titleMap = JSON.parse(nav.title)
      const title = titleMap[code]??titleMap["en"]
      if (title) nav.title = title
    } catch (_) {}

    if (isArray(nav.children)) {
      nav.children.forEach(child => {
        try {
          const titleMap = JSON.parse(child.title)
          const title = titleMap[code]??titleMap["en"]
          if (title) child.title = title
        } catch (_) {}
    
      })
    }
  })
  const onMinimodeChange = () => {
    setMiniMode(!miniMode);
    storage.set(SidemenuMinimodeKey, !miniMode)
  }

  const bottomNavs = [
    { title: t.new, icon: "FaPlus", url: `${ReserveUrls.New}/dashboard`, isActive: asPath.startsWith(ReserveUrls.New) },
    { title: t.configuration, icon: "FaCog", url: `${ReserveUrls.Config}/datasources`, isActive: asPath.startsWith(ReserveUrls.Config) },
  ]
  config.showAlertIcon && bottomNavs.push({ title: t.alert, icon: "FaBell", url: `${ReserveUrls.Alerts}`, isActive: asPath.startsWith(ReserveUrls.Alerts) })
  bottomNavs.push({ title: t1.search, icon: "FaSearch", url: `${ReserveUrls.Search}`, isActive: asPath.startsWith(ReserveUrls.Search) })

  const [isLargeScreen] = useMediaQuery(MobileBreakpoint)

  const paddingLeft = 8
  const paddingRight = 8
  const childMarginLeft = 26
  const navSize = 15
  const navWidth = useMemo(() => {
    let navWidth = 0

    if (!miniMode) {
      concat(sidemenu ?? [], bottomNavs as any).forEach(nav => {
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

    if (navWidth < minNavSize) {
      navWidth = minNavSize
    }

    return navWidth
  }, [sidemenu, miniMode, bottomNavs])

  const miniWidth = isLargeScreen ? 55 : 0
  const sideWidth = (fullscreen || !isLargeScreen) ? 0 : (miniMode ? miniWidth : navWidth + 13)
  const textColor = useColorModeValue("gray.500", "whiteAlpha.800")


  return (
    <HStack id="page-container" width="100%" alignItems="top">
      {
        isLargeScreen
          ?
          <Flex
            display={fullscreen ? "none" : "flex"}
            flexDir="column"
            pl={miniMode ? null : paddingLeft + 'px'}
            pr={miniMode ? null : paddingRight + 'px'}
            justifyContent="space-between"
            id="sidemenu"
            position="fixed"
            top="0"
            left="0"
            bottom="0"
            right="0"
            width={sideWidth + 'px'}
            transition="all 0.2s"
            height="100vh"
            className="bordered-right"
          // overflowY="auto" overflowX="hidden"
          >
            <CustomScrollbar hideHorizontalTrack>
              <Flex flexDir="column" height="100%" justifyContent="space-between">
                <Flex id="sidemenu-top" flexDir="column" alignItems={(miniMode || isEmpty(sidemenu)) ? "center" : "left"}     >
                  {(miniMode || isEmpty(sidemenu)) ?
                    <Box cursor="pointer" onClick={onMinimodeChange} mt="2" ><Logo /></Box>
                    :
                    <Box cursor="pointer" onClick={onMinimodeChange} opacity="0.2" position="absolute" right="-7px" top="14px" className="hover-text" p="1" fontSize="0.7rem" zIndex={1}><Icons.FaChevronLeft /></Box>
                  }
                  <VStack alignItems="left" mt={3} spacing={miniMode ? 1 : "10px"}>
                  {sidemenu?.map((link, index) => {
                    return <Box key={link.url} >
                      <Box>
                        <NavItem isActive={miniMode ? asPath.startsWith(link.url) : asPath == link.url} key={index} text={link.title} icon={link.icon} miniMode={miniMode} fontWeight={500} url={link.children?.length > 0 ? link.children[0].url : link.url} children={link.children} />
                      </Box>
                      {
                        !miniMode && link.children && link.children.map((child, index) => {
                          return <Box mt="7px" ml={childMarginLeft + 'px'}><NavItem isActive={asPath == child.url} key={index} text={child.title} miniMode={miniMode} url={child.url} fontSize={navSize} /></Box>
                        })
                      }
                    </Box>
                  })}
                  </VStack>
                  {session && !sidemenu?.some(nav => nav.dashboardId != HomeDashboardId) && <>
                    <Divider mt={miniMode ? 2 : 3} />
                    <Box mt={miniMode ? 2 : 3}><NavItem fontSize={navSize - 1} text={t1.newItem} url={`/cfg/team/${session.user.sidemenu}/sidemenu`} miniMode={miniMode} icon="FaPlus" /></Box>
                  </>}
                </Flex>
                <Flex id="sidemenu-bottom" flexDir="column" pb="2" alignItems={miniMode ? "center" : "left"} color={textColor}   >
                  <VStack alignItems="left" spacing={miniMode ? 1 : 3}>
                    {bottomNavs.map((nav, index) => {
                      if (nav.url == ReserveUrls.Search) {
                        return <Search key={nav.url} title={nav.title} miniMode={miniMode} sideWidth={sideWidth} fontSize={navSize} />
                      } else {
                        return <Box key={nav.url}><NavItem isActive={nav.isActive} text={nav.title} icon={nav.icon} miniMode={miniMode} url={nav.url} /></Box>
                      }
                    })}

                    <Divider />
                    {/* <Box color={textColor}><ColorModeSwitcher miniMode={miniMode} /></Box> */}
                    {!isEmpty(config.repoUrl) && <Box><NavItem text="Github" icon="FaGithub" miniMode={miniMode} url={config.repoUrl} /></Box>}
                    <UserMenu miniMode={miniMode} fontSize={navSize + 'px'} />
                  </VStack>

                </Flex>
              </Flex>
            </CustomScrollbar>

          </Flex>
          :
          <Box position="absolute" zIndex={1} top="10px">
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label='Options'
                icon={<HamburgerIcon />}
                variant='outline'
                size="xs"
              />
              <Portal>
                <MenuList fontSize="15px" py="0" zIndex={1000}>
                  {sidemenu?.map((link) => {
                    const Icon = Icons[link.icon]
                    return <Link key={link.url} to={link.url}>
                      <MenuItem icon={<Icon />} >
                        {link.title}
                      </MenuItem>
                      {
                        link.children && link.children.map((child) => {
                          return <Link key={child.url} to={child.url}>
                            <MenuItem pl="36px">
                              {child.title}
                            </MenuItem></Link>
                        })
                      }
                    </Link>
                  })}
                  <Divider />
                  <>
                    {bottomNavs.map((nav, index) => {
                      const Icon = Icons[nav.icon]
                      if (Icon) {
                        if (nav.url == ReserveUrls.Search) {
                          return <MenuItem  >
                            <Search key={nav.url} title={nav.title} miniMode={false} sideWidth={sideWidth} />
                          </MenuItem>
                        } else {
                          return <Link key={nav.url} to={nav.url}>
                            <MenuItem icon={<Icon />}  >
                              {nav.title}
                            </MenuItem></Link>

                        }
                      }
                    })}

                    <Divider />
                  </>
                  {!isEmpty(config.repoUrl) && <Link to={config.repoUrl}>
                    <MenuItem icon={<Icons.FaGithub />}>
                      Github
                    </MenuItem></Link>}
                  <MenuItem  >
                    <UserMenu miniMode={false} fontSize="14px" />
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          </Box>}
      <Box id="main-container" transition="all 0.2s" width={`calc(100% - ${sideWidth}px)`} ml={sideWidth + 'px'}>
        {React.cloneElement(children, { sideWidth })}
      </Box>
    </HStack>)
}



const NavItem = ({ text, icon = null, miniMode, fontWeight = 400, fontSize = 15, url, isActive = false, children = null }) => {
  const Icon = Icons[icon]
  const textColor = useColorModeValue("gray.500", "whiteAlpha.800")
  const { pathname: asPath } = useLocation()
  return (
    <PopoverTooltip
      trigger={miniMode ? "hover" : null}
      offset={[0, 14]}
      triggerComponent={<Box>
        <Link to={url}>
          <HStack spacing={"10px"} color={isActive ? useColorModeValue("brand.500", "brand.200") : useColorModeValue("gray.500", "whiteAlpha.800")} className="hover-text" cursor="pointer">
            {icon && <Box>
              {miniMode ?
                <IconButton fontSize={"1rem"} aria-label="" variant="ghost" color="current" _focus={{ border: null }} icon={<Icon />} />
                : <Box fontSize="14px"><Icon /></Box>
              }
            </Box>}
            {!miniMode && <Text fontSize={`${fontSize}px`} fontWeight={fontWeight} wordBreak="break-all">{text}</Text>}
          </HStack>
        </Link>
      </Box>}
      showHeaderBorder={children?.length > 0}
      headerComponent={<Link to={children?.length > 0 ? children[0].url : url}><Text fontSize={fontSize}>{text}</Text></Link>}
      bodyComponent={children?.length > 0 && <VStack alignItems="left" spacing="3" py="2" fontSize={fontSize}>
        {children?.length > 0 && children.map(subLink =>
          <Link to={subLink.url} key={subLink.url}>
            <Text color={asPath == subLink.url ? useColorModeValue("brand.500", "brand.200") : textColor}>{subLink.title}</Text>
          </Link>
        )}
      </VStack>}
    />
  )
}

