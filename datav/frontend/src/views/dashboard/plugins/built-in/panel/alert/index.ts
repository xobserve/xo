import { PanelPluginComponents } from 'types/plugin'
import PanelEditor from './Editor'
import AlertPanel from './Alert'
import icon from './icon.svg'
import { LayoutOrientation } from 'types/layout'
import { initAlertFilter } from 'src/data/panel/initPlugins'
import { PanelTypeAlert, AlerSettings } from './types'
import { initPanel } from 'src/data/panel/initPanel'
import { Panel } from 'types/dashboard'
import { PanelTypeStat } from '../stat/types'
import { builtinPanelPlugins } from '../../plugins'
import { VarialbeAllOption } from 'src/data/variable'

const panelComponents: PanelPluginComponents = {
  panel: AlertPanel,
  editor: PanelEditor,
  settings: {
    type: PanelTypeAlert,
    icon,
    initOptions: (p: Panel) => {
      const options: AlerSettings = {
        viewMode: 'list',
        stat: {
          statName: 'Alerts',
          // showGraph: true,
          // color: '$orange',
          // layout: LayoutOrientation.Vertical,
          // colorMode: 'bg-gradient',
          // style: 'bars',
          // valueSize: 60,
          // legendSize: 30,
        },
        disableDatasource: true,
        orderBy: 'newest',
        toolbar: {
          show: true,
          width: 200,
        },
        chart: {
          show: true,
          height: '120px',
          stack: 'auto',
          showLabel: 'auto',
          tooltip: 'single',
        },
        filter: initAlertFilter(),
      }

      const panel: Panel = initPanel(p.id * 10 + 1)
      panel.isSubPanel = true
      panel.type = PanelTypeStat
      panel.allowTypes = [PanelTypeStat]
      const plugin = builtinPanelPlugins[panel.type]
      const statOptions = plugin.settings.initOptions(panel) ?? {}
      statOptions.value.decimal = 0
      statOptions.displaySeries = VarialbeAllOption
      statOptions.showGraph = true
      statOptions.styles.connectNulls = true
      statOptions.styles.showPoints = true
      statOptions.styles.layout = LayoutOrientation.Vertical
      statOptions.styles.colorMode = 'bg-gradient'
      statOptions.styles.style = 'bars'
      statOptions.textSize.value = 60
      statOptions.textSize.legend = 30
      statOptions.showLegend = true

      panel.plugins = {
        [panel.type]: statOptions,
      }
      panel.title = ''

      if (!p.isSubPanel) {
        options.subPanel = panel
      }

      panel.overrides = [
        {
          target: 'Alerts',
          overrides: [
            {
              type: 'Series.thresholds',
              value: {
                mode: 'absolute',
                thresholds: [
                  {
                    color: '$orange',
                    value: null,
                  },
                ],
              },
            },
          ],
        },
      ]

      return options
    },
  },
}

export default panelComponents
