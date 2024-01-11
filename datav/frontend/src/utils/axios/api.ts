import { requestApi } from './request'

export const getTemplatesApi = (templateType, scopeType, scopeId) => {
  return requestApi.get(
    `/template/list/${templateType}/${scopeType}/${scopeId}`,
  )
}
