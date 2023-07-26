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

import { Box, Flex, HStack, IconButton, Input, Modal, ModalBody, ModalContent, ModalHeader, Text, Tooltip, useColorModeValue, useDisclosure } from "@chakra-ui/react"
import React, { memo, useMemo, useState } from "react"
import { FaSearch, FaTimes } from "react-icons/fa"
import { useSearchParam } from "react-use"
import { Dashboard } from "types/dashboard"
import { requestApi } from "utils/axios/request"
import { addParamToUrl } from "utils/url"
import { RxLetterCaseCapitalize } from "react-icons/rx";
import SearchResults from "./SearchResults"
import { Select } from "antd"
import ColorTag from "components/ColorTag"
import TagsFilter from "./TagsFilter"
import { isEmpty } from "utils/validate"
import { Team } from "types/teams"
import TeamsFilter from "./TeamsFilter"
const { Option } = Select;

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
    const load = async () => {
        const res = await requestApi.get("/teams/all")
        console.log("here3333 load teams")
        setTeams(res.data)
    }

    if (teams.length == 0) {
        load()  
    }

    const onSearchOpen = async () => {
        const res = await requestApi.get(`/dashboard/simpleList`)
        setRawDashboards(res.data)
        onOpen()
    }



    const urlQuery = useSearchParam('search')
    if (urlQuery && query === null) {
        onSearchOpen()
        setQuery(urlQuery)
    }

    const onQueryChange = (v) => {
        addParamToUrl({
            search: v
        })
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

    const [dashboards,tagCount,teamCount] = useMemo(() => {
        let result:Dashboard[] = []
        if (!rawDashboards) {
            return [result,null,null]
        }

        for (const dash of rawDashboards) {
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
            teamCount[dash.ownedBy] = (teamCount[dash.ownedBy]?? 0) + 1
            for (const t of (dash.tags??[])) {
                tagCount[t] = (tagCount[t]??0) + 1
            }
        }

        return [result,tagCount,teamCount]
    }, [query, rawDashboards, caseSensitive, selectedTags, selectedTeams])

    return (
        <Box>
            <HStack color={isOpen ? useColorModeValue("brand.500", "brand.200") : 'inherit'} className="hover-text" cursor="pointer">
                <Box onClick={onSearchOpen}>
                    {miniMode ?
                        <IconButton fontSize={"1.2rem"} aria-label="" variant="ghost" color="current" _focus={{ border: null }} icon={<FaSearch />} />
                        : <FaSearch />
                    }
                </Box>
                {!miniMode && <Text fontSize={`${fontSize}px`} fontWeight={fontWeight} >{title}</Text>}
            </HStack>
            <Modal isOpen={isOpen} onClose={onClose} size="full">
                <Box sx={{
                    '.chakra-modal__content-container' : {
                        marginLeft: sideWidth + 'px',
                        width: `calc(100% - ${sideWidth}px)`
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
                            <HStack>
                                <TagsFilter value={selectedTags} tags={tags} onChange={setSelectedTags} tagCount={tagCount} />
                                <TeamsFilter value={selectedTeams} teams={teams} onChange={setSelectedTeams} teamCount={teamCount} />
                            </HStack>
                        </Flex>
                        {dashboards?.length > 0 && <SearchResults teams={teams} dashboards={dashboards} onItemClick={onClose} query={query} />}
                    </ModalBody>
                </ModalContent>
                </Box>
            </Modal>
        </Box>
    )
})

export default Search

