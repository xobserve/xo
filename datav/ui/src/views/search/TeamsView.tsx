// Copyright 2023 xObserve.io Team

import { VStack } from '@chakra-ui/react'
import React, { memo } from 'react'
import { Dashboard } from 'types/dashboard'
import DashboardCard from '../dashboard/components/DashboardCard'
import { Team } from 'types/teams'
import useSession from 'hooks/use-session'
import PanelAccordion from '../dashboard/edit-panel/Accordion'

interface Props {
  teams: Team[]
  dashboards: Map<string, Dashboard[]>
  query: string
  onItemClick?: any
  starredIds: Set<string>
}

const TeamsView = memo(
  ({ teams, dashboards, query, onItemClick, starredIds }: Props) => {
    const { session } = useSession()
    const keys = Array.from(dashboards.keys()).sort()
    return (
      <>
        {keys.map((teamId) => (
          <PanelAccordion
            title={
              teams.find((t) => t.id.toString() == teamId)?.name +
              ` ( ${dashboards.get(teamId).length} )`
            }
          >
            <VStack alignItems='left'>
              {dashboards.get(teamId).map((dash) => (
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
          </PanelAccordion>
        ))}
      </>
    )
  },
)

export default TeamsView
