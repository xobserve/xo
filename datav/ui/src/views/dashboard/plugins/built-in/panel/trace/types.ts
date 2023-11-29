import { ClickAction } from 'src/views/dashboard/edit-panel/components/ClickActionsEditor'
import { Panel, PanelEditorProps } from 'types/dashboard'

export const PanelTypeTrace = 'trace'

export interface TracePanel extends Panel {
  plugins: {
    [PanelTypeTrace]: TraceSettings
  }
}

export interface TraceEditorProps extends PanelEditorProps {
  panel: TracePanel
}

export interface TraceSettings {
  defaultService: string
  enableEditService: boolean
  defaultOperation: string
  enableEditOperation: boolean
  interaction: {
    enable: boolean
    actions: ClickAction[]
  }
}
