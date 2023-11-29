// Copyright 2023 xObserve.io Team

import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
  useDisclosure,
  useMediaQuery,
} from '@chakra-ui/react'
import React, { memo, useEffect, useMemo, useState } from 'react'
import {
  FaAlignJustify,
  FaBuffer,
  FaSearch,
  FaSitemap,
  FaTimes,
} from 'react-icons/fa'
import { Dashboard } from 'types/dashboard'
import { requestApi } from 'utils/axios/request'
import { RxLetterCaseCapitalize } from 'react-icons/rx'
import TagsFilter from 'src/components/TagsFilter'
import { isEmpty } from 'utils/validate'
import { Team } from 'types/teams'
import TeamsFilter from './TeamsFilter'
import { AiFillStar, AiOutlineStar, AiOutlineSearch } from 'react-icons/ai'
import ListView from './ListView'
import TeamsView from './TeamsView'
import TagsView from './TagsView'
import PopoverTooltip from 'src/components/PopoverTooltip'
import { useLocation } from 'react-router-dom'
import useBus from 'use-bus'
import { OnDashboardWeightChangeEvent } from 'src/data/bus-events'
import { MobileBreakpoint } from 'src/data/constants'
import Loading from 'src/components/loading/Loading'
import { last } from 'lodash'
import { useStore } from '@nanostores/react'
import { commonMsg, searchMsg } from 'src/i18n/locales/en'
import { $config } from 'src/data/configs/config'

interface Props {
  title: string
  miniMode: boolean
  fontSize?: number
  fontWeight?: number
  sideWidth?: number
}
const Search = memo((props: Props) => {
  const {
    title,
    miniMode,
    fontSize = 15,
    fontWeight = 400,
    sideWidth = 0,
  } = props
  const t = useStore(commonMsg)
  const t1 = useStore(searchMsg)
  const location = useLocation()
  const config = useStore($config)
  const [query, setQuery] = useState<string>(null)
  const [caseSensitive, setCaseSensitive] = useState<boolean>(false)
  const [rawDashboards, setRawDashboards] = useState<Dashboard[]>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [teams, setTeams] = useState<Team[]>(null)
  const [selectedTeams, setSelectedTeams] = useState<number[]>([])
  const [filterStarred, setFilterStarred] = useState<boolean>(false)
  const [starredDashIds, setStarredDashIds] = useState<Set<string>>(new Set())
  const [layout, setLayout] = useState<'teams' | 'list' | 'tags'>('teams')

  useBus(
    OnDashboardWeightChangeEvent,
    (e) => {
      requestApi
        .get(`/dashboard/search/${config.currentTenant}`)
        .then((res) => {
          setRawDashboards(res.data)
        })
    },
    [rawDashboards],
  )

  useEffect(() => {
    onClose()
  }, [location])

  const onSearchOpen = async () => {
    if (isOpen) {
      onClose()
      return
    }
    onOpen()
    if (!rawDashboards) {
      const r1 = requestApi.get(`/dashboard/search/${config.currentTenant}`)
      const r2 = requestApi.get(`/dashboard/starred`)
      const res = await Promise.all([r1, r2])

      const dashboards: Dashboard[] = res[0].data

      setRawDashboards(dashboards)
      const starred = new Set<string>()
      for (const id of res[1].data) {
        starred.add(id)
      }
      setStarredDashIds(starred)

      const dashTeamsMap = {}
      for (const dash of dashboards) {
        dashTeamsMap[dash.ownedBy] = {
          id: dash.ownedBy,
          name: dash.ownerName,
        }
      }
      setTeams(Object.values(dashTeamsMap))
    }
  }

  const onQueryChange = (v) => {
    setQuery(v)
  }

  const tags = useMemo(() => {
    const result = []
    if (!rawDashboards) {
      return result
    }
    const tags = new Set()
    for (const dash of rawDashboards) {
      if (isEmpty(dash.tags)) {
        tags.add('untagged')
        continue
      }

      for (const tag of dash.tags ?? []) {
        tags.add(tag)
      }
    }

    for (const tag of tags) {
      result.push(tag)
    }
    return result
  }, [rawDashboards])

  const [dashboards1, tagCount, teamCount] = useMemo(() => {
    let result: Dashboard[] = []
    if (!rawDashboards) {
      return [result, null, null]
    }

    for (const dash of rawDashboards) {
      if (filterStarred && !starredDashIds.has(dash.id)) {
        continue
      }

      const id = caseSensitive
        ? dash.id.toString()
        : dash.id.toString().toLowerCase()
      const title = caseSensitive ? dash.title : dash.title.toLowerCase()
      const q = caseSensitive ? query : query?.toLowerCase()
      if (isEmpty(q) || id.includes(q) || title.includes(q)) {
        if (selectedTags.includes('untagged') && isEmpty(dash.tags)) {
          result.push(dash)
          continue
        }

        if (selectedTags.length > 0) {
          let matched = true
          if (selectedTags.some((tag) => !dash.tags?.includes(tag))) {
            matched = false
          }
          if (matched) result.push(dash)
        } else {
          result.push(dash)
        }
      }
    }

    result = result.filter((dash) => {
      if (selectedTeams.length == 0) {
        return true
      }

      return selectedTeams.some((t) => t == dash.ownedBy)
    })

    const tagCount = new Map()
    const teamCount = new Map()

    for (const dash of result) {
      teamCount[dash.ownedBy] = (teamCount[dash.ownedBy] ?? 0) + 1
      if (isEmpty(dash.tags)) {
        tagCount['untagged'] = (tagCount['untagged'] ?? 0) + 1
        continue
      }
      for (const t of dash.tags) {
        tagCount[t] = (tagCount[t] ?? 0) + 1
      }
    }

    return [result, tagCount, teamCount]
  }, [
    query,
    rawDashboards,
    caseSensitive,
    selectedTags,
    selectedTeams,
    filterStarred,
    starredDashIds,
  ])

  const dashboards: Dashboard[] | Map<string, Dashboard[]> = useMemo(() => {
    if (layout == 'list') {
      return dashboards1
    }

    if (layout == 'teams') {
      const result = new Map<string, Dashboard[]>()
      for (const dash of dashboards1) {
        const teamId = dash.ownedBy.toString()
        if (!result.has(teamId)) {
          result.set(teamId, [])
        }

        result.get(teamId).push(dash)
      }

      return result
    }

    const result = new Map<string, Dashboard[]>()
    for (const dash of dashboards1) {
      if (isEmpty(dash.tags)) {
        if (!result.has('untagged')) {
          result.set('untagged', [])
        }

        result.get('untagged').push(dash)
        continue
      }

      for (const tag of dash.tags ?? []) {
        if (!result.has(tag)) {
          result.set(tag, [])
        }

        result.get(tag).push(dash)
      }
    }
    return result
  }, [dashboards1, layout])

  const [isLargeScreen] = useMediaQuery(MobileBreakpoint)

  return (
    <Box>
      <PopoverTooltip
        trigger={miniMode ? 'hover' : null}
        offset={[0, 14]}
        triggerComponent={
          <HStack
            color={
              isOpen ? useColorModeValue('brand.500', 'brand.200') : 'inherit'
            }
            className='hover-text'
            cursor='pointer'
            onClick={onSearchOpen}
          >
            <Box>
              {miniMode ? (
                <IconButton
                  fontSize={isLargeScreen ? '1rem' : '1rem'}
                  aria-label=''
                  variant='ghost'
                  color='current'
                  _focus={{ border: null }}
                  icon={<FaSearch />}
                />
              ) : (
                <FaSearch fontSize='14px' />
              )}
            </Box>
            {!miniMode && (
              <Text fontSize={`${fontSize}px`} fontWeight={fontWeight}>
                {title}
              </Text>
            )}
          </HStack>
        }
        headerComponent={
          <Text fontSize={`${fontSize}px`} fontWeight={fontWeight}>
            {title}
          </Text>
        }
      />
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size='full'
        autoFocus={false}
        trapFocus={false}
      >
        <Box
          sx={{
            '.chakra-modal__content-container': {
              marginLeft: sideWidth + 'px',
              width: `calc(100% - ${sideWidth}px)`,
              transition: 'all 0.3s',
            },
          }}
        >
          <ModalContent maxH='100vh'>
            <ModalHeader justifyContent='space-between' pb='1'>
              <Flex justifyContent='space-between' alignItems='center'>
                <Text>{t1.searchDashboards}</Text>
                <FaTimes opacity='0.6' cursor='pointer' onClick={onClose} />
              </Flex>
              <Text color='gray.500' fontSize='sm'>
                {t1.searchDashboardsTips}
              </Text>
            </ModalHeader>
            <ModalBody>
              <HStack px='0'>
                <InputGroup size='md' variant='flushed'>
                  <InputLeftElement
                    pointerEvents='none'
                    children={
                      <Box color='gray.500'>
                        <FaSearch />
                      </Box>
                    }
                  />
                  <Input
                    value={query}
                    onChange={(e) => onQueryChange(e.currentTarget.value)}
                    placeholder={t1.searchInput}
                  />
                </InputGroup>
                <Tooltip
                  label={caseSensitive ? t.caseSensitive : t.caseInsensitive}
                >
                  <Box
                    cursor='pointer'
                    onClick={() => setCaseSensitive(!caseSensitive)}
                    color={caseSensitive ? 'brand.500' : 'inherit'}
                    fontWeight='600'
                    className={caseSensitive ? 'highlight-bordered' : null}
                    fontSize='1.1rem'
                    p='1'
                  >
                    <RxLetterCaseCapitalize />
                  </Box>
                </Tooltip>
              </HStack>
              <Flex px='0' mt='2' justifyContent='space-between'>
                <HStack>
                  <TagsFilter
                    value={selectedTags}
                    tags={tags}
                    onChange={(v: string[]) => {
                      if (last(v) == 'untagged') {
                        setSelectedTags(['untagged'])
                      } else if (v.includes('untagged')) {
                        setSelectedTags(v.filter((t) => t != 'untagged'))
                      } else {
                        setSelectedTags(v)
                      }
                    }}
                    tagCount={tagCount}
                    minWidth={isLargeScreen ? '260px' : '48%'}
                  />
                  {teams && (
                    <TeamsFilter
                      value={selectedTeams}
                      teams={teams}
                      onChange={setSelectedTeams}
                      teamCount={teamCount}
                      minWidth={isLargeScreen ? '260px' : '48%'}
                    />
                  )}
                  <Box
                    cursor='pointer'
                    onClick={() => setFilterStarred(!filterStarred)}
                    fontSize='1.3rem'
                    color={useColorModeValue('orange.300', 'orange.200')}
                  >
                    {filterStarred ? <AiFillStar /> : <AiOutlineStar />}
                  </Box>
                </HStack>
                {/* <Input value={query} onChange={e => onQueryChange(e.currentTarget.value)} w={isLargeScreen ? "320px" : "150px"} placeholder="enter dashboard name or id to search.." /> */}
                <HStack spacing={4} fontSize='1.1rem'>
                  <Tooltip label={t1.teamsView}>
                    <Box
                      cursor='pointer'
                      className={layout == 'teams' ? 'color-text' : null}
                      onClick={() => setLayout('teams')}
                    >
                      <FaSitemap />
                    </Box>
                  </Tooltip>
                  <Tooltip label={t1.listView}>
                    <Box
                      cursor='pointer'
                      className={layout == 'list' ? 'color-text' : null}
                      onClick={() => setLayout('list')}
                    >
                      <FaAlignJustify />
                    </Box>
                  </Tooltip>
                  <Tooltip label={t1.tagsView}>
                    <Box
                      cursor='pointer'
                      className={layout == 'tags' ? 'color-text' : null}
                      onClick={() => setLayout('tags')}
                    >
                      <FaBuffer />
                    </Box>
                  </Tooltip>
                </HStack>
              </Flex>
              {teams && dashboards ? (
                <VStack
                  alignItems='left'
                  maxH={`calc(100vh - ${isLargeScreen ? 170 : 215}px)`}
                  overflowY='auto'
                  spacing={2}
                  pt='3'
                >
                  {layout == 'list' && (
                    <ListView
                      teams={teams}
                      dashboards={dashboards as Dashboard[]}
                      onItemClick={onClose}
                      query={query}
                      starredIds={starredDashIds}
                    />
                  )}
                  {layout == 'teams' && (
                    <TeamsView
                      teams={teams}
                      dashboards={dashboards as Map<string, Dashboard[]>}
                      onItemClick={onClose}
                      query={query}
                      starredIds={starredDashIds}
                    />
                  )}
                  {layout == 'tags' && (
                    <TagsView
                      selectedTags={selectedTags}
                      teams={teams}
                      dashboards={dashboards as Map<string, Dashboard[]>}
                      onItemClick={onClose}
                      query={query}
                      starredIds={starredDashIds}
                    />
                  )}
                </VStack>
              ) : (
                <Loading />
              )}
              {!isLargeScreen && (
                <Button mt='2' onClick={onClose}>
                  Close
                </Button>
              )}
            </ModalBody>
          </ModalContent>
        </Box>
      </Modal>
    </Box>
  )
})

export default Search
