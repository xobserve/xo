import { Box, Flex, HStack, Text, IconButton, useColorModeValue } from "@chakra-ui/react"
import Logo from "components/Logo"
import React, { useEffect, useState } from "react"
import { FaAppStore, FaGithub, FaMinus, FaPlus, FaSave, FaServer, FaTimes, FaUser } from "react-icons/fa"
import { measureText } from "utils/measureText"
import * as Icons from "react-icons/fa"
import { concat, max } from "lodash"
import { ColorModeSwitcher } from "components/ColorModeSwitcher"
import { requestApi } from "utils/axios/request"
import { useStore } from "@nanostores/react"
import { commonMsg, sidebarMsg } from "src/i18n/locales/en"
import useSession from "hooks/use-session"
import useFullscreen from "hooks/useFullscreen"
import { Route } from "types/route"
import { navLinks } from "src/data/nav-links"

const miniWidth = 60
const navSize = 15
const maxNavSize = 250

interface Props {
  children: any
  bg?: string
}

const PageContainer = ({ children, bg }: Props) => {
  const t = useStore(commonMsg)
  const t1 = useStore(sidebarMsg)
  const { session } = useSession()

  const [miniMode, setMiniMode] = useState(false)
  const [sidemenu, setSidemenu] = useState<Route[]>([])
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

  const bottomNavs = [
    { title: "Github", icon: "FaGithub", url: "" },
    { title: "用户设置", icon: "FaUser", url: "" },
  ]

  // 由于非 minimode 会展示子菜单，因此我们需要计算最大菜单宽度
  const childMarginLeft = 10
  let navWidth = 0
  const paddingLeft = 8
  const paddingRight = 4
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

  const sideWidth = fullscreen ? 0 : (miniMode ? miniWidth : navWidth)
  const textColor = useColorModeValue("gray.500", "whiteAlpha.800")
  return (
    <HStack id="main" width="100%" alignItems="top">
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
        <Flex id="sidemenu-top" flexDir="column" alignItems={miniMode ? "center" : "left"}>
          {miniMode ?
            <Box cursor="pointer" onClick={() => setMiniMode(!miniMode)} mt="2"><Logo /></Box>
            :
            <Box cursor="pointer" onClick={() => setMiniMode(!miniMode)} opacity="0.2" position="absolute" right="1px" top="12px" className="hover-text" p="1"><Icons.FaChevronLeft /></Box>
          }
          {sidemenu.map((nav, index) => {
            return <Box mt="3">
              <NavItem key={index} text={nav.title} icon={nav.icon} miniMode={miniMode} fontWeight={500} fontSize={navSize} />
              {
                !miniMode && nav.children && nav.children.map((child, index) => {
                  return <Box mt="6px" ml={childMarginLeft + 'px'}><NavItem key={index} text={child.title} miniMode={miniMode} fontSize={navSize - 1} /></Box>
                })
              }
            </Box>
          })}
        </Flex>
        <Flex id="sidemenu-bottom" flexDir="column" pb="2" alignItems={miniMode ? "center" : "left"}>
          <Box color={textColor}><ColorModeSwitcher miniMode={miniMode} /></Box>
          {bottomNavs.map((nav, index) => {
            return <Box mt="3"><NavItem key={index} text={nav.title} icon={nav.icon} miniMode={miniMode} /></Box>
          })}
        </Flex>
      </Flex>
      <Box id="container" transition="all 0.2s" width={`calc(100% - ${sideWidth}px)`} ml={sideWidth + 'px'}>
        {React.cloneElement(children, { sideWidth })}
      </Box>
    </HStack>)
}

export default PageContainer

const NavItem = ({ text, icon = null, miniMode, fontWeight = 400, fontSize = 16 }) => {
  const Icon = Icons[icon]
  return (<>
    <HStack color={useColorModeValue("gray.500", "whiteAlpha.800")} className="hover-text" cursor="pointer">
      {icon && <Box>
        {miniMode ?
          <IconButton fontSize={"1.2rem"} aria-label="" variant="ghost" color="current" _focus={{ border: null }} icon={<Icon />} />
          : <Icon />
        }
      </Box>}
      {!miniMode && <Text fontSize={`${fontSize}px`} fontWeight={fontWeight} >{text}</Text>}
    </HStack>
  </>)
}