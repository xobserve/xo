import { configureStore as reduxConfigureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { ThunkMiddleware } from 'redux-thunk';
import { setStore } from './store';
import { StoreState } from 'src/types/store';
import {  createRootReducer } from './reducers/root';
 
 
export function configureStore() {
  const middleware = process.env.NODE_ENV !== 'production' ? [] : [];

  const reduxDefaultMiddleware = getDefaultMiddleware<StoreState>({
    thunk: true,
    serializableCheck: false,
    immutableCheck: false,
  } as any);

  const store = reduxConfigureStore<StoreState>({
    reducer: createRootReducer(),
    middleware: [...reduxDefaultMiddleware, ...middleware] as [ThunkMiddleware<StoreState>],
    // devTools: process.env.NODE_ENV !== 'production',
    // preloadedState: {
    //   navIndex: buildInitialState(),
    },
  );

  setStore(store);
  return store;
}

