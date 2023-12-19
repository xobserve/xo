import { requestApi } from './request'

export const getTemplatesApi = (type, teamId) => {
  return requestApi.get(`/template/list/${type}?teamId=${teamId}`)
}
