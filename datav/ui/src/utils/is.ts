// Copyright 2023 xObserve.io Team

export const isUndefined = (val: any): val is undefined =>
  typeof val === 'undefined'

export const isNull = (val: any): val is null => val === null

/**
 * 值不存在
 */
export const isNullOrUndefined = (val: any) => isNull(val) || isUndefined(val)

/**
 * 值存在
 */
export const isNotNullOrUndefined = (val: any) => !isNullOrUndefined(val)

export const isBrowser = () => typeof window !== 'undefined'

export const isMobAgent = (userAgent: string) =>
  /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i.test(
    userAgent,
  ) || userAgent.toLowerCase().indexOf('micromessenger') !== -1

export const isJSON = (str: string) => {
  if (typeof str == 'string') {
    try {
      const obj = JSON.parse(str)
      if (typeof obj === 'object' && obj) {
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  } else {
    return false
  }
}

export const toJSON = (str: string) => {
  if (typeof str == 'string') {
    try {
      const obj = JSON.parse(str)
      if (typeof obj === 'object' && obj) {
        return obj
      } else {
        return null
      }
    } catch (e) {
      return null
    }
  } else {
    return null
  }
}

export const toPrettyJSON = (str: string) => {
  if (typeof str == 'string') {
    try {
      const obj = JSON.parse(str)
      if (typeof obj === 'object' && obj) {
        return JSON.stringify(obj, null, 2)
      } else {
        return str
      }
    } catch (e) {
      return str
    }
  } else {
    return str
  }
}

export const compareId = (a: string | number, b: string | number) => a == b
