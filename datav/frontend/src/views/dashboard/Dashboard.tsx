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

import { Box, useColorMode, useMediaQuery } from '@chakra-ui/react'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Dashboard, Panel, PanelTypeRow } from 'types/dashboard'
import DashboardHeader from 'src/views/dashboard/DashboardHeader'
import DashboardGrid from 'src/views/dashboard/grid/DashboardGrid'
import { clone, cloneDeep, defaultsDeep, find, findIndex } from 'lodash'
import { initVariableSelected } from 'src/views/variables/Loader'
import {
  prevQueries,
  prevQueryData,
} from 'src/views/dashboard/grid/PanelGrid/PanelGrid'
import { unstable_batchedUpdates } from 'react-dom'
import useBus from 'use-bus'
import {
  OnClonePanel,
  SetDashboardEvent,
  UpdatePanelEvent,
} from 'src/data/bus-events'
import React from 'react'
import { useImmer } from 'use-immer'
import { setAutoFreeze } from 'immer'
import { initPanelStyles } from 'src/data/panel/initStyles'
import Border from 'src/components/largescreen/components/Border'
import useFullscreen from 'hooks/useFullscreen'
import { initDashboard } from 'src/data/dashboard'
import { initPanel, initPanelType } from 'src/data/panel/initPanel'
import { DashboardHeaderHeight, GRID_COLUMN_COUNT } from 'src/data/constants'
import { updateTimeToNewest } from 'src/components/DatePicker/DatePicker'
import { $variables } from '../variables/store'
import { useStore } from '@nanostores/react'
import { VarialbeAllOption } from 'src/data/variable'
import EditPanel from './edit-panel/EditPanel'
import { $dashboard } from './store/dashboard'
import DashboardAnnotations from './DashboardAnnotations'
import { clearPanelRealTime } from './store/panelRealtime'
import storage from 'utils/localStorage'
import { PreviousColorModeKey } from 'src/data/storage-keys'
import { isEmpty } from 'utils/validate'
import Loading from 'src/components/loading/Loading'
import { Team } from 'types/teams'
import { $teams } from '../team/store'
import { getNextPanelId } from './AddPanel'
import { builtinPanelPlugins } from './plugins/built-in/plugins'
import { externalPanelPlugins } from './plugins/external/plugins'
import { useSearchParam, useLocation } from 'react-use'

setAutoFreeze(false)

// All of the paths that is not defined in pages directory will redirect to this page,
// generally these pages are defined in:
// 1. team's side menu, asscessed by a specific url path
// 2. dashboard page, accessed by a dashboard id
const DashboardWrapper = ({ rawDashboard, sideWidth }) => {
  const vars = useStore($variables)
  const [dashboard, setDashboard] = useImmer<Dashboard>(null)
  const { setColorMode, colorMode, toggleColorMode } = useColorMode()
  // const [gVariables, setGVariables] = useState<Variable[]>([])
  const fullscreen = useFullscreen()
  const edit = useSearchParam('edit')
  useLocation()

  const initDash = (dash) => {
    dash.data.panels.forEach((panel: Panel) => {
      // console.log("33333 before",cloneDeep(panel.plugins))
      if (panel.type != PanelTypeRow) {
        panel = defaultsDeep(panel, delete initPanel().plugins[initPanelType])
        const plugin =
          builtinPanelPlugins[panel.type] ?? externalPanelPlugins[panel.type]
        if (plugin) {
          panel.plugins[panel.type] = defaultsDeep(
            panel.plugins[panel.type],
            plugin.settings.initOptions,
          )
        }
        panel.styles = defaultsDeep(panel.styles, initPanelStyles)
      }
      // console.log("33333 after",cloneDeep(panel.plugins[panel.type]),cloneDeep(panel.overrides))
    })

    const d1 = defaultsDeep(dash, initDashboard())
    return d1
  }

  // combine variables which defined separately in dashboard and global
  const setDashboardVariables = (dash: Dashboard, team: Team) => {
    const dashVars = cloneDeep(dash.data.variables)
    initVariableSelected(dashVars)

    const globalVars = $variables
      .get()
      .filter((v) => !v.id.toString().startsWith('d-'))
    const vars = [...dashVars, ...globalVars]
    $variables.set(vars)
  }

  useLayoutEffect(() => {
    updateTimeToNewest()
    const dash: Dashboard = initDash(rawDashboard)
    const team = $teams.get().find((t) => t.id == dash.ownedBy)
    unstable_batchedUpdates(() => {
      setDashboardVariables(rawDashboard, team)

      setDashboard(cloneDeep(dash))
    })
    return () => {
      // for (const k of Array.from(prevQueries.keys())) {
      //     prevQueries.delete(k)
      //     prevQueryData.delete(k)
      // }
      prevQueries.clear()
      prevQueryData.clear()
      clearPanelRealTime()
      const previousColorMode = storage.get(PreviousColorModeKey)
      if (previousColorMode) {
        storage.remove(PreviousColorModeKey)
        setColorMode(previousColorMode)
      }
    }
  }, [])

  useBus(
    (e) => {
      return e.type == SetDashboardEvent
    },
    (e) => {
      const dash = initDash(e.data)
      setDashboard(clone(dash))
    },
  )

  useBus(
    (e) => {
      return e.type == UpdatePanelEvent
    },
    (e) => {
      setDashboard((dash: Dashboard) => {
        const i = findIndex(dash.data.panels, (p) => p.id == e.data.id)
        if (i >= 0) {
          dash.data.panels[i] = e.data
        }
      })
    },
  )

  useBus(
    (e) => {
      return e.type == OnClonePanel
    },
    (e) => {
      const target = e.data
      setDashboard((dash: Dashboard) => {
        const panel = dash.data.panels.find((p) => p.id == target)
        const newPanel = cloneDeep(panel)
        newPanel.id = getNextPanelId(dash)
        if (panel.gridPos.x + panel.gridPos.w * 2 <= GRID_COLUMN_COUNT) {
          newPanel.gridPos.x += panel.gridPos.w
        } else {
          // add below
          newPanel.gridPos.y += panel.gridPos.h
        }
        dash.data.panels.unshift(newPanel)
        dash.data.panels.sort((panelA, panelB) => {
          if (panelA.gridPos.y === panelB.gridPos.y) {
            return panelA.gridPos.x - panelB.gridPos.x
          } else {
            return panelA.gridPos.y - panelB.gridPos.y
          }
        })
      })
    },
    [],
  )

  useEffect(() => {
    if (dashboard) {
      $dashboard.set(dashboard)
      setTimeout(() => {
        if (dashboard.data.styles?.bgEnabled && dashboard?.data.styles?.bg) {
          let bodyStyle = document.body.style
          const bg = dashboard?.data.styles?.bg
          if (bg) {
            bodyStyle.background = `url(${bg.url})`

            bodyStyle.backgroundSize = 'cover'
            if (colorMode !== bg.colorMode) {
              // if (!storage.get(PreviousColorModeKey)) {
              //     storage.set(PreviousColorModeKey, colorMode)
              //     toggleColorMode()
              // }
              bodyStyle.background = null
            }
          }

          if (!isEmpty(dashboard.data.styles.bgColor)) {
            bodyStyle.backgroundColor = dashboard.data.styles.bgColor
          }
        }
      }, 1)
    }

    return () => {
      let bodyStyle = document.body.style
      bodyStyle.background = null
    }
  }, [dashboard])

  useEffect(() => {
    const bg = dashboard?.data.styles?.bg
    if (dashboard?.data.styles?.bgEnabled && bg) {
      let bodyStyle = document.body.style
      if (colorMode !== bg.colorMode) {
        bodyStyle.background = null
      } else {
        bodyStyle.background = `url(${bg.url})`
        bodyStyle.backgroundSize = 'cover'
      }
    }
  }, [colorMode])

  const onDashbardChange = useCallback((tempPanel) => {
    setDashboard((dashboard) => {
      for (var i = 0; i < dashboard.data.panels.length; i++) {
        if (dashboard.data.panels[i].id === tempPanel.id) {
          dashboard.data.panels[i] = tempPanel
          break
        }
      }
    })
  }, [])

  const hidingVars = dashboard?.data?.hidingVars?.toLowerCase().split(',')
  const visibleVars = vars.filter((v) => {
    return (
      v.id.toString().startsWith('d-') ||
      !find(hidingVars, (v1) => v.name.toLowerCase().match(v1))
    )
  })

  const headerHeight = fullscreen
    ? 0
    : (visibleVars.length > 0
        ? DashboardHeaderHeight
        : DashboardHeaderHeight - 25) + 7

  const panels = useMemo(() => {
    let panels
    if (dashboard) {
      const panels0 = dashboard.data.panels.filter((panel: Panel) => {
        let render = false
        if (panel.enableConditionRender) {
          if (panel.conditionRender.type == 'variable') {
            const cond = panel.conditionRender.value.split('=')
            if (cond.length == 2) {
              const v = vars.find((v) => v.name == cond[0])
              if (
                v.selected == VarialbeAllOption ||
                v.selected?.match(cond[1])
              ) {
                render = true
              }
            }
          }
        } else {
          render = true
        }

        if (dashboard.data.hiddenPanels.includes(panel.id)) {
          render = false
        }

        return render
      })

      if (panels0.length != dashboard.data.panels.length) {
        panels = panels0
      } else {
        panels = dashboard.data.panels
      }
    }

    return panels
  }, [dashboard, vars])

  const [isLargeScreen] = useMediaQuery('(min-width: 600px)')
  const panelInEdit = dashboard?.data?.panels.find(
    (p) => p.id.toString() === edit,
  )

  return (
    <>
      {dashboard ? (
        <Box
          className='dashboard-container'
          px={fullscreen ? 0 : isLargeScreen ? 2 : 3}
          width='100%'
          minHeight='100vh'
          maxHeight='100vh'
          overflowY='auto'
          position='relative'
        >
          {/* <Decoration decoration={dashboard.data.styles.decoration}/> */}
          <DashboardHeader
            dashboard={dashboard}
            onChange={onDashbardChange}
            sideWidth={sideWidth}
          />
          <Box
            // key={dashboard.id + fullscreen}
            id='dashboard-wrapper'
            mt={sideWidth == 0 ? 0 : headerHeight - 15 + 'px'}
            pb='2'
            position='relative'
          >
            <DashboardBorder
              key={fullscreen.toString()}
              border={dashboard.data.styles.border}
            />
            <Box id='dashboard-scroll-top'></Box>
            {dashboard.data.panels?.length > 0 && (
              <DashboardGrid
                dashboard={dashboard}
                panels={panels}
                onChange={onDashbardChange}
              />
            )}
          </Box>
          <EditPanel
            dashboard={dashboard}
            onChange={onDashbardChange}
            initPanel={panelInEdit}
          />
          <DashboardAnnotations dashboard={dashboard} />
        </Box>
      ) : (
        <Box position='fixed' top='50vh' left='50vw'>
          <Loading />
        </Box>
      )}
    </>
  )
}

export default DashboardWrapper

const DashboardBorder = ({ border }) => {
  const [height, setHeight] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    ref.current = setInterval(() => {
      const ele = document.getElementById('dashboard-grid')
      const h = ele?.offsetHeight
      setHeight(h)
    }, 500)
    return () => {
      clearInterval(ref.current)
    }
  }, [])

  return (
    <>
      {height > 0 && (
        <Box
          key={height}
          position='absolute'
          width={'100%'}
          top={0}
          bottom={0}
          id='dashboard-border'
        >
          <Border width='100%' height='100%' border={border}>
            <Box height='100%' width='100%'></Box>
          </Border>
        </Box>
      )}
    </>
  )
}
