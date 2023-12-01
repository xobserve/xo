// Copyright 2023 xObserve.io Team

import { Box, Flex, HStack, Tooltip, useMediaQuery } from '@chakra-ui/react'
import SelectVariables from 'src/views/variables/SelectVariable'
import { isEmpty } from 'lodash'
import React from 'react'
import { memo } from 'react'
import ReserveUrls from 'src/data/reserve-urls'
import { Dashboard } from 'types/dashboard'
import AddPanel from './AddPanel'
import DashboardSave from './DashboardSave'
import DashboardSettings from './settings/DashboardSettings'
import Fullscreen from 'src/components/Fullscreen'
import useFullscreen from 'hooks/useFullscreen'
import DatePicker from 'src/components/DatePicker/DatePicker'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '@nanostores/react'
import { dashboardMsg } from 'src/i18n/locales/en'
import DashboardShare from './DashboardShare'
import DashboardStar from './components/DashboardStar'
import { $variables } from '../variables/store'
import { MobileBreakpoint } from 'src/data/constants'
import CustomScrollbar from 'src/components/CustomScrollbar/CustomScrollbar'
import DashboardRefresh from './DashboardRefresh'
import { catelogVariables } from '../variables/utils'
import { useSearchParam } from 'react-use'
import useEmbed from 'hooks/useEmbed'

interface HeaderProps {
  dashboard: Dashboard
  onChange: any
  sideWidth?: number
}
const DashboardHeader = memo(
  ({ dashboard, onChange, sideWidth }: HeaderProps) => {
    const vars = useStore($variables)
    const t1 = useStore(dashboardMsg)
    const navigate = useNavigate()
    const fullscreen = useFullscreen()
    const teamId = useParams().teamId
    const toolbar = useSearchParam('toolbar')
    const readonly = useSearchParam('readonly')
    const embed = useEmbed()

    const [isLargeScreen] = useMediaQuery(MobileBreakpoint)
    const [dvars, gvars] = catelogVariables(vars, dashboard)

    return (
      <Box
        id='dashboard-header'
        display={fullscreen && toolbar != 'on' ? 'none' : 'block'}
        pt='1'
        // width={sideWidth ? `calc(100% - ${sideWidth})` : "100%"}
        position={sideWidth ? 'fixed' : 'static'}
        top='0'
        right='0'
        left={sideWidth + 'px'}
        px='10px'
        bg={
          dashboard.data.styles.bgEnabled && dashboard.data.styles?.bg
            ? 'transparent'
            : 'var(--chakra-colors-chakra-body-bg)'
        }
        zIndex={1001}
        transition='all 0.2s'
      >
        {
          <>
            <Flex justifyContent='space-between'>
              <HStack
                textStyle={isLargeScreen ? 'title' : null}
                pl={isLargeScreen ? 0 : '17px'}
              >
                {isLargeScreen && (
                  <>
                    <Tooltip label={t1.headerTeamTips}>
                      <Box
                        cursor={!embed && 'pointer'}
                        onClick={
                          !embed
                            ? () => navigate(`/${teamId}/cfg/team/members`)
                            : null
                        }
                      >
                        {dashboard.ownerName}
                      </Box>
                    </Tooltip>
                    <Box>/</Box>
                  </>
                )}
                <Box>{dashboard.title}</Box>
                {isLargeScreen && !embed && (
                  <>
                    <DashboardStar
                      dashboardId={dashboard.id}
                      fontSize='1.1rem'
                    />
                    <DashboardShare
                      dashboard={dashboard}
                      fontSize='0.9rem'
                      opacity='0.8'
                      cursor='pointer'
                      className='hover-text'
                    />
                  </>
                )}
              </HStack>

              <HStack>
                <HStack spacing='0'>
                  {readonly != 'on' && (
                    <>
                      <AddPanel dashboard={dashboard} onChange={onChange} />
                      <DashboardSave dashboard={dashboard} />
                      {dashboard && (
                        <DashboardSettings
                          dashboard={dashboard}
                          onChange={onChange}
                        />
                      )}
                    </>
                  )}
                  <DatePicker showTime />
                  {isLargeScreen && (
                    <HStack spacing={0}>
                      <DashboardRefresh />
                      {!embed && <Fullscreen />}
                    </HStack>
                  )}
                </HStack>
              </HStack>
            </Flex>
            {!isEmpty(vars) && (
              <Flex mt='0' maxW={`calc(100% - ${10}px)`}>
                <CustomScrollbar hideVerticalTrack>
                  <Flex justifyContent='space-between'>
                    <SelectVariables variables={dvars} />
                    <SelectVariables variables={gvars} />
                  </Flex>
                </CustomScrollbar>
              </Flex>
            )}
          </>
        }
      </Box>
    )
  },
)

export default DashboardHeader
