// Copyright 2023 xObserve.io Team

import { Box, Text, VStack } from '@chakra-ui/react'
import React, { memo, useState } from 'react'
import { Dashboard } from 'types/dashboard'
import DashboardCard from '../dashboard/components/DashboardCard'
import { Team } from 'types/teams'
import ColorTag from 'src/components/ColorTag'
import useSession from 'hooks/use-session'

interface Props {
  teams: Team[]
  dashboards: Map<string, Dashboard[]>
  query: string
  onItemClick?: any
  starredIds: Set<string>
  selectedTags: string[]
}

const TagsView = memo(
  ({
    teams,
    dashboards,
    query,
    onItemClick,
    starredIds,
    selectedTags,
  }: Props) => {
    const { session } = useSession()
    const keys = Array.from(dashboards.keys())
      .sort()
      .filter((tag) => {
        if (selectedTags.length == 0) {
          return true
        }
        return selectedTags.includes(tag)
      })
    return (
      <>
        {keys.map((tag) => (
          <Box>
            <ColorTag name={tag} />
            <VStack alignItems='left' mt='2'>
              {dashboards.get(tag).map((dash) => (
                <DashboardCard
                  dashboard={dash}
                  owner={teams.find((team) => team.id == dash.ownedBy)}
                  onClick={onItemClick}
                  query={query}
                  starred={starredIds.has(dash.id)}
                  session={session}
                />
              ))}
            </VStack>
          </Box>
        ))}
      </>
    )
  },
)

export default TagsView
