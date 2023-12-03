// Copyright 2023 xObserve.io Team

import moment from 'moment'
import { systemDateFormats } from './formats'

export const dateTimeFormat = (dateInUtc, options?) =>
  moment.utc(dateInUtc).local().format(getFormat(options))

const getFormat = (options?): string => {
  return options?.format ?? systemDateFormats.fullDate
}
