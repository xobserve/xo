import {get} from 'lodash'
import uiJson from '../../i18n/ui.json'

// TODO: load the locale appropriate ui.json file
export function t(str: string) {
  return get(uiJson, str)
}
