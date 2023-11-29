// Copyright 2023 xObserve.io Team

// Display the sidemenus available for current user, including:
// 1. teams which the user is a member of
// 2. teams whose sidemenu has been set to public

import {
  Flex,
  HStack,
  IconButton,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Text,
  useMediaQuery,
  useToast,
} from '@chakra-ui/react'
import { useStore } from '@nanostores/react'
import CardSelect, { CardSelectItem } from 'src/components/cards/CardSelect'
import React from 'react'
import { FaAlignLeft } from 'react-icons/fa'
import { MobileVerticalBreakpoint } from 'src/data/constants'
import { sidebarMsg } from 'src/i18n/locales/en'
import { $config } from 'src/data/configs/config'
import { selectTenant } from 'utils/tenant'

const SelectUserTenant = ({ miniMode, tenants }) => {
  const t1 = useStore(sidebarMsg)
  const toast = useToast()
  const config = useStore($config)

  const [isMobileScreen] = useMediaQuery(MobileVerticalBreakpoint)
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
              <Text fontSize='1em'>
                {t1.selectTenant} -{' '}
                {tenants.find((t) => t.id == config?.currentTenant)?.name}
              </Text>
            )}
          </HStack>
        </PopoverTrigger>
        <Portal>
          <PopoverContent
            width='fit-content'
            minWidth='120px'
            border='null'
            pl='1'
          >
            <PopoverBody>
              <CardSelect title=''>
                {tenants.map((tenant) => (
                  <CardSelectItem
                    key={tenant.id}
                    selected={config?.currentTenant == tenant.id}
                    onClick={() =>
                      selectTenant(
                        tenant.id,
                        config?.currentTeam?.toString(),
                        config,
                        toast,
                      )
                    }
                  >
                    <Flex
                      width='200px'
                      alignItems='center'
                      fontSize='1em'
                      fontWeight='550'
                      px='2'
                      py='1'
                      justifyContent='space-between'
                    >
                      <Text>{tenant.name}</Text>
                      <Text opacity={0.7} fontWeight={400}>
                        {tenant.numTeams} teams
                      </Text>
                    </Flex>
                  </CardSelectItem>
                ))}
              </CardSelect>
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
    </>
  )
}

export default SelectUserTenant
