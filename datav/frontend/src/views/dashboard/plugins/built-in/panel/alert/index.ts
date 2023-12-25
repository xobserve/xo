import { PanelPluginComponents } from 'types/plugin'
import PanelEditor from './Editor'
import AlertPanel from './Alert'
import icon from './icon.svg'
import { LayoutOrientation } from 'types/layout'
import { initAlertFilter } from 'src/data/panel/initPlugins'
import { PanelTypeAlert } from './types'

const panelComponents: PanelPluginComponents = {
  panel: AlertPanel,
  editor: PanelEditor,
  settings: {
    type: PanelTypeAlert,
    icon,
    initOptions: {
      viewMode: 'list',
      stat: {
        showGraph: true,
        color: '$orange',
        layout: LayoutOrientation.Vertical,
        colorMode: 'bg-gradient',
        style: 'bars',
        statName: 'Alerts',
        valueSize: 60,
        legendSize: 30,
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
    },
  },
}

export default panelComponents
