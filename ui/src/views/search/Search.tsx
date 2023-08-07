// Copyright 2023 Datav.io Team
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

import { Box, Flex, HStack, IconButton, Input, Modal, ModalBody, ModalContent, ModalHeader, Text, Tooltip, VStack, useColorModeValue, useDisclosure } from "@chakra-ui/react"
import React, { memo, useMemo, useState } from "react"
import { FaAlignJustify, FaBuffer, FaSearch, FaSitemap, FaTimes } from "react-icons/fa"
import { Dashboard } from "types/dashboard"
import { requestApi } from "utils/axios/request"
import { RxLetterCaseCapitalize } from "react-icons/rx";
import TagsFilter from "./TagsFilter"
import { isEmpty } from "utils/validate"
import { Team } from "types/teams"
import TeamsFilter from "./TeamsFilter"
import { AiFillStar, AiOutlineStar } from "react-icons/ai"
import { sortBy } from "lodash"
import ListView from "./ListView"
import TeamsView from "./TeamsView"
import TagsView from "./TagsView"
import PopoverTooltip from "components/PopoverTooltip"

interface Props {
    title: string
    miniMode: boolean
    fontSize?: number
    fontWeight?: number
    sideWidth?: number
}
const Search = memo((props: Props) => {
    const { title, miniMode, fontSize = 15, fontWeight = 400, sideWidth = 0 } = props
    const [query, setQuery] = useState<string>(null)
    const [caseSensitive, setCaseSensitive] = useState<boolean>(false)
    const [rawDashboards, setRawDashboards] = useState<Dashboard[]>(null)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [teams, setTeams] = useState<Team[]>([])
    const [selectedTeams, setSelectedTeams] = useState<number[]>([])
    const [filterStarred, setFilterStarred] = useState<boolean>(false)
    const [starredDashIds, setStarredDashIds] = useState<Set<string>>(new Set())
    const [layout, setLayout] = useState<"teams" | "list" | "tags">("teams")

    const load = async () => {
        const res = await requestApi.get("/teams/all")
        setTeams(res.data)
    }
    
    if (teams.length == 0) {
        load()
    }

    const onSearchOpen = async () => {
        if (isOpen) {
            onClose()
            return 
        }
        const r1 = requestApi.get(`/dashboard/simpleList`)
        const r2 = requestApi.get(`/dashboard/starred`)
        const res = await Promise.all([r1, r2])

        setRawDashboards(sortBy(res[0].data, dash => dash.title))
        const starred = new Set<string>()
        for (const id of res[1].data) {
            starred.add(id)
        }
        setStarredDashIds(starred)
        onOpen()
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
            for (const tag of (dash.tags ?? [])) {
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

            const id = caseSensitive ? dash.id.toString() : dash.id.toString().toLowerCase()
            const title = caseSensitive ? dash.title : dash.title.toLowerCase()
            const q = caseSensitive ? query : query?.toLowerCase()
            if (isEmpty(q) || (id.includes(q) || title.includes(q))) {
                if (selectedTags.length > 0) {
                    let matched = true
                    if (selectedTags.some(tag => !dash.tags?.includes(tag))) {
                        matched = false
                    }
                    if (matched) result.push(dash)
                } else {
                    result.push(dash)
                }
            }
        }

        result = result.filter(dash => {
            if (selectedTeams.length == 0) {
                return true
            }

            return selectedTeams.some(t => t == dash.ownedBy)
        })

        const tagCount = new Map()
        const teamCount = new Map()

        for (const dash of result) {
            teamCount[dash.ownedBy] = (teamCount[dash.ownedBy] ?? 0) + 1
            for (const t of (dash.tags ?? [])) {
                tagCount[t] = (tagCount[t] ?? 0) + 1
            }
        }

        return [result, tagCount, teamCount]
    }, [query, rawDashboards, caseSensitive, selectedTags, selectedTeams, filterStarred, starredDashIds])

    const dashboards: Dashboard[] | Map<string, Dashboard[]> = useMemo(() => {
        if (layout == "list") {
            return dashboards1
        }

        if (layout == "teams") {
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
            for (const tag of dash.tags ?? []) {
                if (!result.has(tag)) {
                    result.set(tag, [])
                }
    
                result.get(tag).push(dash)
            }
        }
        return result

    }, [dashboards1, layout])

    return (
        <Box>
            <PopoverTooltip
                trigger={miniMode ? "hover" : null}
                offset={[0, 14]}
                triggerComponent={
                    <HStack color={isOpen ? useColorModeValue("brand.500", "brand.200") : 'inherit'} className="hover-text" cursor="pointer" onClick={onSearchOpen}>
                    <Box>
                        {miniMode ?
                            <IconButton fontSize={"1.2rem"} aria-label="" variant="ghost" color="current" _focus={{ border: null }} icon={<FaSearch />} />
                            : <FaSearch />
                        }
                    </Box>
                    {!miniMode && <Text fontSize={`${fontSize}px`} fontWeight={fontWeight} >{title}</Text>}
                </HStack>
                }
                headerComponent={
                    <Text fontSize={`${fontSize}px`} fontWeight={fontWeight} >{title}</Text>
                }
            />
            <Modal isOpen={isOpen} onClose={onClose} size="full">
                <Box sx={{
                    '.chakra-modal__content-container': {
                        marginLeft: sideWidth + 'px',
                        width: `calc(100% - ${sideWidth}px)`,
                        transition: 'all 0.3s'
                    }
                }}>
                    <ModalContent maxH="100vh">
                        <ModalHeader justifyContent="space-between">
                            <Flex justifyContent="space-between" alignItems="center">
                                <Text>Search dashboard</Text>
                                <FaTimes opacity="0.6" cursor="pointer" onClick={onClose} />
                            </Flex>
                        </ModalHeader>
                        <ModalBody >
                            <Flex justifyContent="space-between" alignItems="center" mb="2">
                                <HStack>
                                    <Input value={query} onChange={e => onQueryChange(e.currentTarget.value)} w="320px" placeholder="enter dashboard name or id to search.." />
                                    <Tooltip label={caseSensitive ? "Case sensitive" : "Case insensitive"}>
                                        <Box
                                            cursor="pointer"
                                            onClick={() => setCaseSensitive(!caseSensitive)}
                                            color={caseSensitive ? "brand.500" : "inherit"}
                                            fontWeight="600"
                                            className={caseSensitive ? "highlight-bordered" : null}
                                            p="1"
                                            fontSize="1.1rem"
                                        >
                                            <RxLetterCaseCapitalize />
                                        </Box>
                                    </Tooltip>
                                </HStack>
                                <HStack spacing={4} fontSize="1.1rem">
                                    <Tooltip label="Teams view"><Box cursor="pointer" className={layout == "teams" ? "color-text" : null} onClick={() => setLayout("teams")}><FaSitemap /></Box></Tooltip>
                                    <Tooltip label="List view"><Box cursor="pointer" className={layout == "list" ? "color-text" : null} onClick={() => setLayout("list")}><FaAlignJustify /></Box></Tooltip>
                                    <Tooltip label="Tags view"><Box cursor="pointer" className={layout == "tags" ? "color-text" : null} onClick={() => setLayout("tags")}><FaBuffer /></Box></Tooltip>
                                </HStack>
                                <HStack>
                                    <Box cursor="pointer" onClick={() => setFilterStarred(!filterStarred)} fontSize="1.3rem" color={useColorModeValue("orange.300", "orange.200")}>
                                        {filterStarred ? <AiFillStar /> : <AiOutlineStar />}
                                    </Box>

                                    <TagsFilter value={selectedTags} tags={tags} onChange={setSelectedTags} tagCount={tagCount} />
                                    <TeamsFilter value={selectedTeams} teams={teams} onChange={setSelectedTeams} teamCount={teamCount} />
                                </HStack>
                            </Flex>
                            <VStack alignItems="left" maxH="calc(100vh - 130px)" overflowY="scroll" spacing={3} pt="3">
                                {
                                    layout == "list" && <ListView teams={teams} dashboards={dashboards as Dashboard[]} onItemClick={onClose} query={query} starredIds={starredDashIds} />
                                }
                                {
                                    layout == "teams" && <TeamsView teams={teams} dashboards={dashboards as Map<string, Dashboard[]>} onItemClick={onClose} query={query} starredIds={starredDashIds} />
                                }
                                {
                                    layout == "tags" && <TagsView teams={teams} dashboards={dashboards as Map<string, Dashboard[]>} onItemClick={onClose} query={query} starredIds={starredDashIds} />
                                }    
                            </VStack>
                        </ModalBody>
                    </ModalContent>
                </Box>
            </Modal>
        </Box>
    )
})

export default Search

