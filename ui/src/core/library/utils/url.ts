import queryString from 'query-string'
import _ from 'lodash'
import {getTimeSrv} from 'src/core/services/time'
import { getVariables } from 'src/views/variables/state/selectors'

// time params, variable params etc, add all of theme to url
export const addParamsToUrl = () => {
    const timeSrv = getTimeSrv()
    const urlRange = timeSrv.timeRangeForUrl();
    const currentQuery = getUrlParams()
    _.extend(currentQuery, urlRange)
    const params = queryString.stringify(currentQuery)

    const vars = getVariables()
    console.log(vars)
    updateUrl(params)
}

export const addParamToUrl = (param: any) => {
    const currentQuery = getUrlParams()
    _.extend(currentQuery, param)
    const params = queryString.stringify(currentQuery)
    updateUrl(params)
}

export const setParamToUrl = (params) => {
    updateUrl(queryString.stringify(params))
}

export const removeParamFromUrl = (paramKeys: string[]) => {
    const currentQuery = getUrlParams()
    paramKeys.forEach((key) => delete currentQuery[key])

    const params = queryString.stringify(currentQuery)

    updateUrl(params)
}

export const getUrlParams = ():any => {
    return  queryString.parseUrl(window.location.href).query
}

export const updateUrl = (params: string) => {
    let url = window.location.origin + window.location.pathname
    if (params != '') {
        url = url + '?' + params 
    }
    window.history.pushState({},null,url);
}

