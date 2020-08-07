
import en from './en'
import zh from './zh'


import {Langs} from './types'
import { setLocaleData } from 'src/packages/datav-core/src'

const localeData =  {
    [Langs.English]: en,
    [Langs.Chinese]: zh
}

setLocaleData(localeData)

export default localeData
