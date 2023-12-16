export enum TemplateType {
  App = 1,
  Dashboard = 2,
  Panel = 3,
}

export enum TemplateScope {
  Website = 1,
  Tenant = 2,
  Team = 3,
}

export const BuiltinTemplateProvider = 'xobserve'
export const CustomTemplateProvider = 'user-custom'

export interface Template {
  id: number
  type: TemplateType
  title: string
  description: string
  scope: TemplateScope
  ownedBy: number
  contentId: number
  provider: string
  created: string
}

export interface TemplateContent {
  id: number
  templateId: number
  content: string
  description: string
  created: string
}
