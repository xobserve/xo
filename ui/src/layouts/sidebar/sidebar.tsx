import {
  chakra,
  Flex,
  HStack,
  IconButton,
  useColorModeValue,
  Box,
  VStack,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  Divider,
  Tooltip
} from "@chakra-ui/react"
import React, { useEffect, useState } from "react"
import * as Icons from "react-icons/fa"


import Logo from "components/Logo"
import { navLinks } from "src/data/nav-links"
import { ColorModeSwitcher } from "components/ColorModeSwitcher"
import customColors from "src/theme/colors"

import UserMenu from "components/user/UserMenu"
import ReserveUrls from "src/data/reserve-urls"

import useSession from "hooks/use-session"
import { requestApi } from "utils/axios/request"
import { Route } from "types/route"
import { dispatch } from "use-bus"
import { MiniSidemenuEvent } from "src/data/bus-events"
import storage from "utils/localStorage"
import { SidemenuMinimodeKey } from "src/data/storage-keys"
import useFullscreen from "hooks/useFullscreen"
import { config } from "src/data/configs/config"
import { Link, useLocation } from "react-router-dom"
import { useStore } from "@nanostores/react"
import { commonMsg, sidebarMsg } from "src/i18n/locales/en"



interface Props {
  bg: string
}


const Sidebar = (props: Props) => {
  const t = useStore(commonMsg)
  const t1 = useStore(sidebarMsg)
  const { session } = useSession()
  const ref = React.useRef<HTMLHeadingElement>()

  const [miniMode, setMiniMode] = useState(storage.get(SidemenuMinimodeKey) ?? true)

  const { pathname: asPath } = useLocation()



  const borderColor = useColorModeValue(customColors.borderColor.light, customColors.borderColor.dark)

  const [sidemenu, setSidemenu] = useState<Route[]>(navLinks)
  const fullscreen = useFullscreen()
  useEffect(() => {
    if (session) {
      loadSidemenu()
    }
  }, [session])

  const loadSidemenu = async () => {
    const res = await requestApi.get(`/team/sidemenu/${session.user.sidemenu}`)
    setSidemenu(res.data.data)
  }

  const onMinimodeChange = () => {
    setMiniMode(!miniMode);
    dispatch({ type: MiniSidemenuEvent, data: !miniMode })
    storage.set(SidemenuMinimodeKey, !miniMode)
  }

  return (
    <Box minWidth={miniMode ? "58px" : "130px"} display={fullscreen ? "none" : "block"}>
      <chakra.header
        ref={ref}
        transition="box-shadow 0.2s"
        pos="fixed"
        top="0"
        zIndex="3"
        left="0"
        bottom="0"
        pr={miniMode ? 0 : 2}
        borderRight={`1px solid ${borderColor}`}
        bg={props.bg ? 'transparent' : 'var(--chakra-colors-chakra-body-bg)'}
        {...props}
      >
        <chakra.div height="100%">
          <Flex className="vertical-nav" h="100%" align="center" justify="space-between" direction="column" py="4">
            <VStack align="center" spacing={1}>
              <Box onClick={onMinimodeChange}>
                <Logo />
              </Box>
              {sidemenu.length > 0 && asPath && <VStack p="0" pt="2" spacing={miniMode ? 0 : 1} fontSize="1rem" alignItems="left" >
                {sidemenu.map(link => {
                  let arialCurrent = undefined
                  if (link.url == "/") {
                    if (link.url == asPath) {
                      arialCurrent = "page"
                    }
                  } else {
                    if (`${asPath + '/'}`.startsWith(`${link.url + '/'}`)) {
                      arialCurrent = "page"
                    }
                  }

                  return <HStack cursor="pointer" px={miniMode ? 2 : 1} py="0.3rem" rounded="md" key={link.url} color={useColorModeValue("gray.500", "whiteAlpha.800")}>
                    <Popover trigger="hover" placement="right">
                      <PopoverTrigger>
                        <Box>
                          <NavItem asPath={asPath} url={link.children?.length > 0 ? link.children[0].url : link.url} path={link.url} icon={link.icon} title={link.title} miniMode={miniMode} fontSize="1.2rem" />
                        </Box>
                      </PopoverTrigger>
                      <PopoverContent width="fit-content" minWidth="120px" border="null" pl="1">
                        <PopoverHeader borderBottomWidth={link.children?.length > 0 ? '1px' : '0px'}>
                          <Link to={link.children?.length > 0 ? link.children[0].url : link.url}>{link.title}</Link>
                        </PopoverHeader>
                        {link.children?.length > 0 && <PopoverBody pt="3">
                          <VStack alignItems="left" spacing="3">
                            {link.children.map(subLink =>
                              <Link to={subLink.url} key={subLink.url}>
                                <Text color={asPath == subLink.url ? useColorModeValue("brand.500", "brand.200") : useColorModeValue("gray.500", "whiteAlpha.800")}>{subLink.title}</Text>
                              </Link>
                            )}
                          </VStack>
                        </PopoverBody>}
                      </PopoverContent>
                    </Popover>
                  </HStack>
                }

                )}
              </VStack>}
            </VStack>

            <VStack
              spacing={miniMode ? 0 : "3"}
              color={useColorModeValue("gray.500", "gray.400")}
              alignItems="left"
              pl="1"
            >
              <NavItem asPath={asPath} url={`${ReserveUrls.New}/dashboard`} path={ReserveUrls.New} icon="FaPlus" title={t.new} miniMode={miniMode} showTooltip />
              <NavItem asPath={asPath} url={`${ReserveUrls.Config}/datasources`} path={ReserveUrls.Config} icon="FaCog" title={t.configuration} miniMode={miniMode} showTooltip />
              <NavItem asPath={asPath} url={`${ReserveUrls.Alerts}`} path={ReserveUrls.Alerts} icon="FaBell" title={t.alert} miniMode={miniMode} showTooltip />
              <NavItem asPath={asPath} url={`${ReserveUrls.Search}`} path={ReserveUrls.Search} icon="FaSearch" title={t1.search} miniMode={miniMode} showTooltip />
              <Divider />
          

              <Link
                to={config.repoUrl}
              >
                <HStack spacing="2">
                  {miniMode ?  <IconButton
                    size="md"
                    fontSize="1.2rem"
                    aria-label=""
                    variant="ghost"
                    color="current"
                    _focus={{ border: null }}
                    icon={<Icons.FaGithub />}
                  /> : <Icons.FaGithub fontSize="1.1rem"/> }
                 

                  {!miniMode && <Text fontSize="0.95rem">Github</Text>}
                </HStack>
              </Link>

                <ColorModeSwitcher fontSize="1.2rem" miniMode={miniMode} />

                <UserMenu miniMode={miniMode} />
        

            </VStack>
          </Flex>
        </chakra.div>
      </chakra.header>
    </Box>
  )
}


export default Sidebar


const NavItem = ({ asPath, path, miniMode, title, icon, url, fontSize = "1.2rem", showTooltip = false }) => {
  const Icon = Icons[icon]
  return <Link to={url}>
    <HStack spacing="0" color={asPath.startsWith(path) ? useColorModeValue("brand.500", "brand.200") : "current"}>
      <Tooltip label={miniMode && (showTooltip && title)} placement="right">
        <HStack spacing={2}>
          {!miniMode ? <Icon fontSize={fontSize} /> :
            <IconButton
              size="md"
              fontSize={fontSize}
              aria-label=""
              variant="ghost"
              color="current"
              _focus={{ border: null }}
              icon={<Icon />}
            />}
          {!miniMode && <Text fontSize="0.95rem" cursor="pointer">{title}</Text>}
        </HStack>
      </Tooltip>
    </HStack>
  </Link>
}