// Copyright 2023 xObserve.io Team

import {
  Box,
  HStack,
  Text,
  useColorModeValue,
  useMediaQuery,
} from '@chakra-ui/react'
import customColors from 'src/theme/colors'
import { Route } from 'types/route'
import React from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '@nanostores/react'
import { commonMsg, navigateMsg } from 'src/i18n/locales/en'
import { MobileVerticalBreakpoint } from 'src/data/constants'
import Loading from 'src/components/loading/Loading'

interface Props {
  title: string
  subTitle?: any
  icon?: any
  children: React.ReactNode
  tabs?: Route[]
  isLoading?: boolean
}

const Page = (props: Props) => {
  const t = useStore(commonMsg)
  const t1 = useStore(navigateMsg)
  const { title, subTitle, icon, children, tabs, isLoading = false } = props

  const borderColor = useColorModeValue(
    customColors.borderColor.light,
    customColors.borderColor.dark,
  )
  const border = `1px solid ${borderColor}`

  const activeTab = tabs?.find((tab) => tab.url === window.location.pathname)
  const [isMobileScreen] = useMediaQuery(MobileVerticalBreakpoint)
  return (
    <>
      <Box width='100%'>
        <HStack spacing='4' px={!isMobileScreen ? 12 : 6} py='8'>
          <Box fontSize='2.5rem'>{icon}</Box>
          <Box width='100%'>
            <Box textStyle='mainTitle'>{title}</Box>
            {typeof subTitle == 'string' ? (
              <Text mt='1' ml='1' textStyle={'subTitle'}>
                {subTitle}
              </Text>
            ) : (
              subTitle
            )}
          </Box>
        </HStack>
        <HStack
          px={!isMobileScreen ? 12 : 2}
          spacing={!isMobileScreen ? 8 : 0}
          borderBottom={border}
        >
          {tabs?.map((tab, index) => {
            return (
              <Link to={tab.url} key={index}>
                <HStack
                  spacing='2'
                  borderLeft={tab.url == activeTab?.url ? border : null}
                  borderRight={tab.url == activeTab?.url ? border : null}
                  cursor='pointer'
                >
                  <Box
                    className={
                      tab.url == activeTab?.url ? 'top-gradient-border' : null
                    }
                  >
                    <HStack py='2' px={!isMobileScreen ? 3 : 2}>
                      {!isMobileScreen && tab.icon}
                      <Text fontSize='1rem'>
                        {t[tab.title] ?? t1[tab.title]}
                      </Text>
                    </HStack>
                  </Box>
                </HStack>
              </Link>
            )
          })}
        </HStack>

        <Box mt='8' px={!isMobileScreen ? 12 : 2}>
          {isLoading ? <Loading style={{ marginTop: '50px' }} /> : children}
        </Box>
      </Box>
    </>
  )
}

export default Page
