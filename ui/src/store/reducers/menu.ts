import React from 'react'
import { createAction } from '@reduxjs/toolkit';
import {MenuItem} from 'src/types'

export interface MenuState {
    items: MenuItem[]
}

export const initialState: MenuState = {
    items: []
}

export const updateMenuItems = createAction<MenuItem[]>('routes/updateMenuItems');

export const menuReducer = (state = initialState, action: any) => {
  if (updateMenuItems.match(action)) {
    return {...state, items: action.payload}
  }

  return state;
};

export default {
  menu: menuReducer,
};


