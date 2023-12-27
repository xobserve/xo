import { Dashboard, Panel } from 'types/dashboard'
import { TemplateContent, TemplateData } from 'types/template'
import { requestApi } from './axios/request'

export const extractPanelTemplateContent = (panel: Panel): Partial<Panel> => {
  delete panel.id
  delete panel.title
  delete panel.gridPos
  delete panel.enableConditionRender
  delete panel.conditionRender
  delete panel.enableScopeTime
  delete panel.scopeTime
  delete panel.templateId

  return panel
}

export const replaceDashboardTemplatePanels = async (dash: Dashboard) => {
  const templateIds = []
  for (const p of dash.data.panels) {
    if (p.templateId) {
      templateIds.push(p.templateId.toString())
    }
  }

  if (templateIds.length > 0) {
    const res1 = await requestApi.post(`/template/content/byIds`, {
      ids: templateIds,
    })
    const contents: TemplateContent[] = res1.data
    for (const p of dash.data.panels) {
      if (p.templateId) {
        const templateContent = contents.find(
          (c) => c.templateId == p.templateId,
        )?.content
        if (templateContent) {
          const content: TemplateData = JSON.parse(templateContent)

          for (const k of Object.keys(content.panel)) {
            p[k] = content.panel[k]
          }
        }
      }
    }
  }
}
