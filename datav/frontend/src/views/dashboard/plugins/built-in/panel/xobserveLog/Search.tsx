// Copyright 2023 xObserve.io Team

import {
  Box,
  Divider,
  Flex,
  HStack,
  Tag,
  Text,
  useMediaQuery,
  VStack,
} from '@chakra-ui/react'
import ColorKV from 'components/ColorKV'
import SearchInput from 'components/input/SearchInput'
import React, { useState } from 'react'
import { useSearchParam } from 'react-use'
import { PanelForceRequeryEvent } from 'src/data/bus-events'
import { Panel } from 'types/dashboard'
import useBus, { dispatch } from 'use-bus'
import { isEmpty } from 'utils/validate'
import { $xobserveQueryParams } from '../../datasource/xobserve/store'

interface Props {
  panel: Panel
}

export const OnLogSearchChangeEvent = 'on-log-search-change'
const Search = ({ panel }: Props) => {
  const [isSmallScreen] = useMediaQuery('(max-width: 1200px)')
  const isLargeScreen = !isSmallScreen
  const [query, setQuery] = useState('')
  const edit = useSearchParam('edit')

  useBus(
    (e) => {
      return e.type == OnLogSearchChangeEvent + panel.id
    },
    (e) => {
      const { query: q, isNew } = e.data
      let newQuery
      if (isNew) {
        newQuery = q
      } else {
        if (isEmpty(query)) {
          newQuery = q
        } else {
          newQuery = query + ' && ' + q
        }
      }
      setQuery(newQuery)
      onSearch(newQuery)
    },
    [query],
  )

  const onSearch = (q?: string) => {
    const params = $xobserveQueryParams.get()
    $xobserveQueryParams.set({
      ...params,
      search: encodeURIComponent((q ?? query).toLowerCase()),
    })

    dispatch(PanelForceRequeryEvent + panel.id)
  }

  const inputWidth = 500
  return (
    <Box
      position={isLargeScreen && !edit ? 'fixed' : null}
      left={isLargeScreen && !edit ? `calc(50% - ${inputWidth / 2}px)` : null}
      top='5px'
      display='flex'
      alignItems='center'
      justifyContent='center'
      zIndex={1002}
      width={500}
    >
      <SearchInput
        placeholder='Search your logs, press Enter to submit...'
        width={isLargeScreen ? inputWidth : '100%'}
        value={query}
        onChange={setQuery}
        onConfirm={onSearch}
        size='sm'
      >
        <Box fontSize='0.95rem'>
          <Text>Examples</Text>
          <Divider mt='2' />
          <VStack alignItems='left' mt='2'>
            <Flex gap='0' flexDirection='column'>
              <ColorKV
                k='severity=error && service=hotrod'
                v='Search logs whose severity is error and service is hotrod'
                renderString={false}
              />
            </Flex>
            <Flex gap='0' flexDirection='column'>
              <ColorKV
                k='(severity=error || severity=info) && body=~/redis timeout/'
                v="First search logs whost severity is error or severity is warn, and then search logs whose body contains 'redis timeout' in the result of last step"
                renderString={false}
              />
            </Flex>
            <Flex gap='0' flexDirection='column'>
              <ColorKV
                k='resources.container_id=b39fb8a20536 and attributes.rawlog=~/dispatch successful/'
                v='We can also search the fields in log resources and attributes'
                renderString={false}
              />
            </Flex>
            <Flex gap='0' flexDirection='column'>
              <ColorKV
                k={`resources.service_name="1" && severity_number=1`}
                v={`You can use "1" to mark this value as a string, as comparision the value in 'severity_number=1' is an int64 number`}
                renderString={false}
              />
            </Flex>
          </VStack>
        </Box>
        <Box fontSize='0.95rem'>
          <Text mt='2'>Docs</Text>
          <Divider mt='2' />
          <VStack alignItems='left' mt='2'>
            <VStack alignItems='left'>
              <Flex gap='2' justifyContent='space-between'>
                <Text>Comparators (exactly match)</Text>
                <HStack spacing={1}>
                  {`= != > >= < <=`.split(' ').map((c, i) => (
                    <Tag key={i}>{c}</Tag>
                  ))}
                </HStack>
              </Flex>
              <Flex gap='2' justifyContent='space-between'>
                <Text>Logical operations</Text>
                <HStack spacing={1}>
                  {`|| &&`.split(' ').map((c, i) => (
                    <Tag key={i}>{c}</Tag>
                  ))}
                </HStack>
              </Flex>
              <Flex gap='2' justifyContent='space-between'>
                <Text>
                  Like (Find strings that contains the target substring)
                </Text>
                <HStack spacing={1}>
                  {`=~ !~`.split(' ').map((c, i) => (
                    <Tag key={i}>{c}</Tag>
                  ))}
                </HStack>
              </Flex>
            </VStack>
          </VStack>
        </Box>
      </SearchInput>
    </Box>
  )
}

export default Search
