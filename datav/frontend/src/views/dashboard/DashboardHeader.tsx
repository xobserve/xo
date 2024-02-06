// Copyright 2023 xobserve.io Team
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
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  Tooltip,
  useMediaQuery,
  useToast,
} from '@chakra-ui/react'
import VariablesLoader from 'src/views/variables/Loader'
import { concat, isEmpty } from 'lodash'
import React from 'react'
import { memo } from 'react'
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
import ColorTag from 'components/ColorTag'
import { addParamToUrl, navigateTo } from 'utils/url'
import TemplateBadge from '../template/TemplateBadge'
import { requestApi } from 'utils/axios/request'
import { ExternalLinkComponent } from 'components/ExternalLinks'

interface HeaderProps {
  dashboard: Dashboard
  onChange: any
  sideWidth?: number
}
const DashboardHeader = memo(
  ({ dashboard, onChange, sideWidth }: HeaderProps) => {
    const toast = useToast()
    const vars = useStore($variables)
    const t1 = useStore(dashboardMsg)
    const fullscreen = useFullscreen()
    const teamId = useParams().teamId
    const toolbar = useSearchParam('toolbar')
    const readonly = useSearchParam('readonly')
    const embed = useEmbed()

    const [isLargeScreen] = useMediaQuery(MobileBreakpoint)
    const [dvars, gvars] = catelogVariables(vars, dashboard)

    const unlinkTemplate = async () => {
      await requestApi.post(
        `/template/unlink/dashboard/${dashboard.ownedBy}/${dashboard.id}`,
      )
      toast({
        title: 'Template unlinked,reloading..',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }

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
                            ? () => navigateTo(`/${teamId}/cfg/team/members`)
                            : null
                        }
                      >
                        {dashboard.ownerName}
                      </Box>
                    </Tooltip>
                    <Box>/</Box>
                  </>
                )}
                <Popover trigger='hover'>
                  <PopoverTrigger>
                    <HStack>
                      <Box cursor='pointer'>{dashboard.title}</Box>
                      {dashboard.templateId != 0 && (
                        <TemplateBadge
                          templateId={dashboard.templateId}
                          unlinkTemplate={unlinkTemplate}
                        />
                      )}
                    </HStack>
                  </PopoverTrigger>
                  {dashboard.tags.length > 0 && (
                    <PopoverContent>
                      <PopoverBody>
                        <HStack spacing={2}>
                          {dashboard.tags.map((tag) => {
                            return (
                              <ColorTag
                                name={tag}
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                  addParamToUrl({
                                    search: 'open',
                                    searchTags: tag,
                                  })
                                }}
                              />
                            )
                          })}
                        </HStack>
                      </PopoverBody>
                    </PopoverContent>
                  )}
                </Popover>

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
              <Flex
                flexWrap='wrap'
                mt='0'
                alignItems='center'
                columnGap={3}
                rowGap={0}
              >
                <VariablesLoader variables={concat(gvars, dvars)} />
                <Box flexGrow={1}></Box>
                <>
                  {dashboard.links.map((link) => (
                    <ExternalLinkComponent link={link} />
                  ))}
                </>
              </Flex>
            )}
          </>
        }
      </Box>
    )
  },
)

export default DashboardHeader
