import { Panel } from 'types/dashboard'

export const extractPanelTemplateContent = (panel: Panel): Partial<Panel> => {
  return {
    type: panel.type,
    plugins: panel.plugins,
    styles: panel.styles,
    overrides: panel.overrides,
  }
}
