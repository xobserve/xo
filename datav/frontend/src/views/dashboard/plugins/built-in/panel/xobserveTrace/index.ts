import { PanelPluginComponents } from 'types/plugin'
import PanelEditor from './Editor'
import TracePanelWrapper from './Trace'
import { mockTraceDataForTestDataDs } from './mocks/mockData'
import icon from './icon.svg'
import { PanelType, TraceSettings } from './types'

const initSettings = (): TraceSettings => ({
  defaultService: '${service}',
  enableEditService: false,
  defaultOperation: '${operation}',
  enableEditOperation: false,
  chart: {
    height: 100,
    type: 'bar',
    stack: false,
    left: 1,
    right: 3,
    top: 6,
    bottom: 15,
  },
})

const panelComponents: PanelPluginComponents = {
  panel: TracePanelWrapper,
  editor: PanelEditor,
  mockDataForTestDataDs: mockTraceDataForTestDataDs,
  settings: {
    type: PanelType,
    icon,
    initOptions: initSettings(),
    disableAutoQuery: true,
  },
}

export default panelComponents
