import { createAction } from '@reduxjs/toolkit';



import storage from 'src/core/library/utils/localStorage'

import {Role} from 'src/types'

export interface UserState {
  id: number;
  username: string;
  name: string;
  email: string;
  sidemenu: number;
  role: Role;
  mobile?: string;
  lastSeenAt?: string;
  isDisabled? : boolean
}

const cachedUser = storage.get("user")
export const initialState: UserState = cachedUser ? cachedUser :
  {
    id: null,
    name: null,
    email: null,
    role: null,
    mobile: null,
    isDisabled: false
  };

export const updateUser = createAction<UserState>('user/update');


export const userReducer = (state = initialState, action: any) => {
  if (updateUser.match(action)) {
    storage.set("user",action.payload)
    return { ...action.payload}
  }

  return state;
};



export default {
  user: userReducer,
};