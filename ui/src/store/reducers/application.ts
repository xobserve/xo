import { createAction } from '@reduxjs/toolkit';

import storage from 'src/core/library/utils/localStorage'
import {config, setCurrentLang} from 'src/packages/datav-core/src'
import { Langs } from 'src/core/library/locale/types';
 
export  interface ApplicationState {
  theme: string,
  locale: string,
  startDate: any,
  endDate: any,
  breadcrumbText: string
}

const defaultBreadCrumbText = 'Default Title'
export const initialState: ApplicationState = {
  startDate: storage.get('app.startDate') || config.application.startDate(),
  endDate: storage.get('app.endDate') || config.application.endDate(),
  locale : storage.get('app.locale') || config.application.locale,
  theme: storage.get('app.theme') || config.application.theme,
  breadcrumbText: defaultBreadCrumbText
}; 

setCurrentLang(initialState.locale)

export const updateLocale = createAction<string>('application/locale');
export const updateTheme = createAction<string>('application/theme');
export const updateStartDate = createAction<any>('application/startDate');
export const updateEndDate = createAction<any>('application/endDate');
export const updateBreadcrumbText = createAction<string>('application/breadcrumbText');

export const applicationReducer = (state = initialState, action: any) => {
  if (updateLocale.match(action)) {
    const locale = state.locale=== Langs.English? Langs.Chinese: Langs.English
    storage.set('app.locale', locale)
    setCurrentLang(locale)
    return {...state, locale}
  } 
  
  if (updateTheme.match(action)) {
    storage.set('app.theme',action.payload)
    return {...state,theme: action.payload}
  }

  if (updateStartDate.match(action)) {
    storage.set('app.startDate',action.payload)
    return {...state,startDate: action.payload}
  }

  if (updateEndDate.match(action)) {
    storage.set('app.endDate',action.payload)
    return {...state,endDate: action.payload}
  }

  if (updateBreadcrumbText.match(action)) {
    const text = action?.payload ?? defaultBreadCrumbText
    return {...state,breadcrumbText: text}
  }

  return state;
};


  
export default {
    application: applicationReducer,
};
  