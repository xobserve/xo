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

// Display the sidemenus available for current user, including:
// 1. teams which the user is a member of
// 2. teams whose sidemenu has been set to public

import {
  Box,
  Center,
  HStack,
  IconButton,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Tag,
  Text,
  Tooltip,
  VStack,
  useMediaQuery,
  useToast,
} from '@chakra-ui/react'
import { useStore } from '@nanostores/react'
import CardSelect, { CardSelectItem } from 'src/components/cards/CardSelect'
import React from 'react'
import { FaAlignLeft } from 'react-icons/fa'
import { MobileVerticalBreakpoint } from 'src/data/constants'
import { sidebarMsg } from 'src/i18n/locales/en'
import { requestApi } from 'utils/axios/request'
import { isEmpty } from 'utils/validate'
import { $config } from 'src/data/configs/config'
import { Team } from 'types/teams'
import { $accessToken } from 'src/views/accesstoken/store'

interface TenantTeam {
  tenantId: number
  tenantName: string
  teams: Team[]
}

interface Props {
  miniMode: boolean
  tenants: TenantTeam[]
}

const SelectUserTeam = ({ miniMode, tenants }: Props) => {
  const t1 = useStore(sidebarMsg)
  const toast = useToast()
  const config = useStore($config)

  const selectTeam = async (teamId) => {
    if (teamId === config?.currentTeam) {
      return
    }
    await requestApi.post(`/team/switch/${teamId}`)
    toast({
      title: 'Team swiched, reloading...',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    setTimeout(() => {
      if (isEmpty(teamId)) {
        window.location.reload()
      } else {
        const path = window.location.pathname
        const accessToken = $accessToken.get()
        if (path.startsWith(`/${config?.currentTeam}/`)) {
          window.location.href =
            path.replace(`/${config?.currentTeam}/`, `/${teamId}/`) +
            (accessToken ? `?accessToken=${accessToken}` : '')
        } else if (path.startsWith(`/${config?.currentTeam}`)) {
          window.location.href =
            path.replace(`/${config?.currentTeam}`, `/${teamId}`) +
            (accessToken ? `?accessToken=${accessToken}` : '')
        } else {
          window.location.href =
            `/${teamId}` + (accessToken ? `?accessToken=${accessToken}` : '')
        }
      }
    }, 1000)
  }

  const [isMobileScreen] = useMediaQuery(MobileVerticalBreakpoint)
  const currentTenant = tenants.find((t) => t.tenantId == config?.currentTenant)

  return (
    <>
      <Popover trigger={isMobileScreen ? 'click' : 'hover'} placement='right'>
        <PopoverTrigger>
          <HStack spacing={3} cursor='pointer' width='100%'>
            {miniMode ? (
              <IconButton
                size='md'
                fontSize='1.3em'
                aria-label=''
                variant='ghost'
                color='current'
                _focus={{ border: null }}
                icon={<FaAlignLeft />}
              />
            ) : (
              <FaAlignLeft fontSize='1em' />
            )}
            {!miniMode && (
              <Tooltip label={t1.selectTeam}>
                <Text fontSize='1em'>
                  {currentTenant?.tenantName} -{' '}
                  {
                    currentTenant?.teams?.find(
                      (t) => t.id == config?.currentTeam,
                    )?.name
                  }
                </Text>
              </Tooltip>
            )}
          </HStack>
        </PopoverTrigger>
        <Portal>
          <PopoverContent
            width='fit-content'
            border='null'
            pl='1'
          >
            <PopoverBody p='0'>
              <HStack alignItems='start' spacing={1}>
                {tenants?.map((tenant) => (
                  <Box>
                    <CardSelect title={tenant.tenantName}>
                      {tenant.teams.map((team) => (
                        <CardSelectItem
                          key={team.id}
                          selected={config?.currentTeam == team.id}
                          onClick={() => selectTeam(team.id)}
                        >
                          <Text fontSize='1em' fontWeight='550' px='2' py='1'>
                            {team.name}
                          </Text>
                        </CardSelectItem>
                      ))}
                    </CardSelect>
                  </Box>
                ))}
              </HStack>
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
    </>
  )
}

export default SelectUserTeam
