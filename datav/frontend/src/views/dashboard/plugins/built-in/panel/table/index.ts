import { PanelPluginComponents } from 'types/plugin'
import PanelEditor from './Editor'
import TablePanel from './Table'
import TableOverridesEditor, {
  TableRules,
  getTableOverrideTargets,
} from './OverridesEditor'
import { mockTableDataForTestDataDs } from './mockData'
import icon from './icon.svg'
import { onClickCommonEvent } from 'src/data/panel/initPlugins'
import { getDefaultPanelColor } from 'utils/colors'
import { PanelTypeTable } from './types'

const panelComponents: PanelPluginComponents = {
  panel: TablePanel,
  editor: PanelEditor,
  overrideEditor: TableOverridesEditor,
  overrideRules: TableRules,
  getOverrideTargets: getTableOverrideTargets,
  mockDataForTestDataDs: mockTableDataForTestDataDs,
  settings: {
    type: PanelTypeTable,
    icon,
    initOptions: () => ({
      showHeader: true,
      bordered: false,
      cellSize: 'middle',
      stickyHeader: false,
      tableWidth: 100,
      column: {
        colorTitle: getDefaultPanelColor(),
        align: 'auto',
        enableSort: false,
        enableFilter: false,
      },
      globalSearch: false,
      enablePagination: false,

      actionColumnName: null,
      actionClumnWidth: null,
      actionButtonSize: 'sm',
    }),
  },
}

export default panelComponents
