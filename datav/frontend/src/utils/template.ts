import { Dashboard, Panel } from 'types/dashboard'
import { TemplateContent, TemplateData, TemplateScope } from 'types/template'
import { requestApi } from './axios/request'

export const extractPanelTemplateContent = (panel: Panel): Partial<Panel> => {
  return {
    type: panel.type,
    plugins: panel.plugins,
    styles: panel.styles,
  }
}

export const extractDashboardTemplateContent = (
  dash: Dashboard,
): Partial<Dashboard> => {
  return dash
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
    for (let i = 0; i < dash.data.panels.length; i++) {
      const p = dash.data.panels[i]

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

export const getTemplateScopeText = (
  scope: TemplateScope,
  lang: 'zh' | 'en' | string,
) => {
  switch (scope) {
    case TemplateScope.Website:
      return lang == 'zh' ? '网站' : 'Website'
    case TemplateScope.Tenant:
      return lang == 'zh' ? '租户' : 'Tenant'
    case TemplateScope.Team:
      return lang == 'zh' ? '团队' : 'Team'
    default:
      return ''
  }
}
