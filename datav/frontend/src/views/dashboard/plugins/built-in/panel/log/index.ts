import { PanelPluginComponents } from 'types/plugin'
import PanelEditor from './Editor'
import LogPanelWrapper from './Log'
import { mockLogDataForTestDataDs } from './mocks/mockData'
import icon from './icon.svg'
import { LayoutOrientation } from 'types/layout'
import { palettes } from 'utils/colors'
import { PanelTypeLog } from './types'

const panelComponents: PanelPluginComponents = {
  panel: LogPanelWrapper,
  editor: PanelEditor,
  mockDataForTestDataDs: mockLogDataForTestDataDs,
  settings: {
    type: PanelTypeLog,
    icon,
    initOptions: () => ({
      showTime: true,
      timeColumnWidth: 160,
      orderBy: 'newest',
      enableDetails: true,
      timeStampPrecision: 'ms',
      enableTransform: false,
      transform: `function transform(rawlog,lodash, moment) {
    const newlog = {
        ...rawlog,
    }

    return newlog
}`,
      labels: {
        display: '',
        width: 240,
        widthMap: '{}',
        layout: LayoutOrientation.Horizontal,
        maxValueLines: null,
      },
      styles: {
        labelColorSyncChart: true,
        labelColor: 'inherit',
        labelValueColor: [{ color: 'inherit', value: null }],
        contentColor: 'inherit',
        fontSize: '0.9rem',
        wrapLine: false,
        wordBreak: 'break-all',
        showlineBorder: true,
        highlight: '',
        highlightColor: palettes[6],
      },
      toolbar: {
        show: true,
        defaultOpen: false,
        width: 200,
      },
      chart: {
        show: true,
        height: '120px',
        showLabel: 'auto',
        stack: 'auto',
        tooltip: 'all',
        categorize: '',
      },
      search: {
        log: '',
        labels: '',
      },
      interaction: {
        enable: false,
        actions: [],
      },
      thresholds: [{ type: null, value: null, key: null, color: 'inherit' }],
    }),
  },
}

export default panelComponents
