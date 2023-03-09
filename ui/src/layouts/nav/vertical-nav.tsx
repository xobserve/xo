import {
  chakra,
  Flex,
  HStack,
  IconButton,
  useColorModeValue,
  Box,
  VStack,
  Text,
  Collapse,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  Divider
} from "@chakra-ui/react"
import siteConfig from "src/data/configs/site-config.json"
import React, { useEffect, useState } from "react"
import * as Icons from "react-icons/fa"

import { useRouter } from "next/router"


import Logo from "components/logo"
import { navLinks } from "src/data/nav-links"
import { ColorModeSwitcher } from "components/ColorModeSwitcher"
import customColors from "src/theme/colors"
import dynamic from "next/dynamic"
import UserMenu from "components/user/UserMenu"
import ReserveUrls from "src/data/reserve-urls"
import Link from "next/link"
import UserSidemenus from "components/team/UserSidemenus"
import useSession from "hooks/use-session"
import { requestApi } from "utils/axios/request"
import { Route } from "types/route"


const VerticalNav = dynamic(async () => (props) => {
  const {session} = useSession()
  const ref = React.useRef<HTMLHeadingElement>()

  const [miniMode, setMiniMode] = useState(true)

  const router = useRouter()
  const { asPath } = router

  

  const borderColor = useColorModeValue(customColors.borderColor.light, customColors.borderColor.dark)

  const [sidemenu, setSidemenu] = useState<Route[]>(navLinks)
  useEffect(() => {
    if (session) {
      loadSidemenu()
    }
  },[session])

  const loadSidemenu = async () => {
    const res = await requestApi.get(`/team/sidemenu/${session.user.sidemenu}`)
    setSidemenu(res.data.data)
  }
  
  return (
    <Box width="80px">
      <chakra.header
        ref={ref}
        transition="box-shadow 0.2s"
        pos="fixed"
        top="0"
        zIndex="3"
        left="0"
        bottom="0"
        borderRight={`1px solid ${borderColor}`}
        bg={'var(--chakra-colors-chakra-body-bg)'}
        {...props}
      >
        <chakra.div height="100%">
          <Flex className="vertical-nav" h="100%" align="center" justify="space-between" direction="column" py="4">
            <VStack align="center">
              <Box onClick={() => setMiniMode(!miniMode)}>
                <Logo />
              </Box>
              {sidemenu.length > 0 && asPath && router && <VStack p="0" pt="2" spacing="0" fontSize="1rem" alignItems="left" >
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

                  return <HStack cursor="pointer" px="4" py="0.3rem" rounded="md" key={link.url} color={useColorModeValue("gray.500", "whiteAlpha.800")}>
                    <Popover trigger="hover" placement="right">
                      <PopoverTrigger>
                        <Box>
                          <NavItem asPath={asPath} url={link.children?.length > 0 ? link.children[0].url : link.url} path={link.url} icon={link.icon} title={link.title} miniMode={miniMode} />
                        </Box>
                      </PopoverTrigger>
                      <PopoverContent width="fit-content" minWidth="120px" border="null" pl="1">
                        <PopoverHeader borderBottomWidth={link.children?.length > 0 ? '1px' : '0px'}>
                          <Link href={link.children?.length > 0 ? link.children[0].url : link.url}>{link.title}</Link>
                        </PopoverHeader>
                        {link.children?.length > 0 && <PopoverBody pt="3">
                          <VStack alignItems="left" spacing="3">
                            {link.children.map(subLink =>
                              <Link href={subLink.url}>
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
              spacing="2"
              color={useColorModeValue("gray.500", "gray.400")}
              alignItems="left"
            >
              <NavItem asPath={asPath} url={`${ReserveUrls.Alerts}`} path={ReserveUrls.Alerts} icon="FaBell" title="告警平台" miniMode={miniMode} />
              <NavItem asPath={asPath} url={`${ReserveUrls.Search}`} path={ReserveUrls.Search} icon="FaSearch" title="探索仪表盘" miniMode={miniMode} />
              <NavItem asPath={asPath} url={`${ReserveUrls.Config}/teams`} path={ReserveUrls.Config} icon="FaCog" title="配置管理" miniMode={miniMode} />
              <Divider />
              <HStack spacing="0">
                <UserSidemenus />
                <Collapse in={!miniMode} ><Text>选择侧菜单</Text></Collapse>
              </HStack>

              <HStack spacing="0">
                <Link
                  href={siteConfig.repo.url}
                >
                  <IconButton
                    size="md"
                    fontSize="1.3rem"
                    aria-label=""
                    variant="ghost"
                    color="current"
                    _focus={{ border: null }}
                    icon={<Icons.FaGithub />}
                  />
                </Link>
                <Collapse in={!miniMode} ><Text>Github地址</Text></Collapse>
              </HStack>

              <HStack spacing="0">
                <ColorModeSwitcher fontSize="1.3rem" />
                <Collapse in={!miniMode} ><Text>深浅色主题</Text></Collapse>
              </HStack>

              <HStack spacing="0">
                <UserMenu />
                <Collapse in={!miniMode} ><Text>个人设置</Text></Collapse>
              </HStack>
    
            </VStack>
          </Flex>
        </chakra.div>
      </chakra.header>
    </Box>
  )
}
  , { ssr: false })


export default VerticalNav


const NavItem = ({ asPath, path, miniMode, title, icon, url }) => {
  const Icon = Icons[icon]
  return <Link href={url}>
    <HStack spacing="0"       color={asPath.startsWith(path) ? useColorModeValue("brand.500", "brand.200") : "current"}>
      <IconButton
        size="md"
        fontSize="1.3rem"
        aria-label=""
        variant="ghost"
        color="current"
        _focus={{ border: null }}
        icon={<Icon />}
      />
      <Collapse in={!miniMode} ><Text>{title}</Text></Collapse>
    </HStack>
  </Link>
}