// Copyright 2023 xObserve.io Team

import React, { memo, useState } from 'react'
import { Dashboard } from 'types/dashboard'
import DashboardCard from '../dashboard/components/DashboardCard'
import { Team } from 'types/teams'
import useSession from 'hooks/use-session'

interface Props {
  teams: Team[]
  dashboards: Dashboard[]
  query: string
  onItemClick?: any
  starredIds: Set<string>
}

const ListView = memo(
  ({ teams, dashboards, query, onItemClick, starredIds }: Props) => {
    const { session } = useSession()
    return (
      <>
        {dashboards.map((dash) => (
          <DashboardCard
            dashboard={dash}
            owner={teams.find((team) => team.id == dash.ownedBy)}
            onClick={onItemClick}
            query={query}
            starred={starredIds.has(dash.id)}
            session={session}
          />
        ))}
      </>
    )
  },
)

export default ListView
