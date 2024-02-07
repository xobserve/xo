import { Scope } from 'types/scope'

export const getScopeText = (scope: Scope, lang: 'zh' | 'en' | string) => {
  switch (scope) {
    case Scope.Website:
      return lang == 'zh' ? '网站' : 'Website'
    case Scope.Tenant:
      return lang == 'zh' ? '租户' : 'Tenant'
    case Scope.Team:
      return lang == 'zh' ? '团队' : 'Team'
    default:
      return ''
  }
}
