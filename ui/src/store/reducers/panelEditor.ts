import { PanelData, DefaultTimeRange, LoadingState } from 'src/packages/datav-core'
import { PanelModel } from 'src/views/dashboard/model'
import { createAction } from '@reduxjs/toolkit';


export interface PanelEditorState {
    /* These are functions as they are mutaded later on and redux toolkit will Object.freeze state so
     * we need to store these using functions instead */
    panel: PanelModel;
    sourcePanel: PanelModel;
    data: PanelData;
    initDone: boolean;
    shouldDiscardChanges: boolean;
    isOpen: boolean;
}

export const initialState = (): PanelEditorState => {
    return {
        panel: new PanelModel({}),
        sourcePanel:  new PanelModel({}),
        data: {
            state: LoadingState.NotStarted,
            series: [],
            timeRange: DefaultTimeRange,
        },
        initDone: false,
        shouldDiscardChanges: false,
        isOpen: false,
    };
};

interface InitEditorPayload {
    panel: PanelModel;
    sourcePanel: PanelModel;
}

export const updateEditorInitState = createAction<any>('panelEditor/updateInitState');
export const closeCompleted = createAction('panelEditor/updateInitState');
export const setDiscardChanges = createAction<boolean>('panelEditor/setDiscardChanges');

export const panelEditorReducer = (state = initialState, action: any) => {
    if (updateEditorInitState.match(action)) {
      return {
          ...state,
          panel: action.payload.panel,
          sourcePanel : action.payload.sourcePanel,
          initDone : true,
          isOpen : true,
          shouldDiscardChanges : false,
      }
    } 
    
    if (closeCompleted.match(action)) {
        return {
            ...state,
            isOpen : false,
            initDone : false
        }
      }
      
      if (setDiscardChanges.match(action)) {
        return {
            ...state,
            shouldDiscardChanges: action.payload
        }
      }
       

    return state;
  };


export default {
    panelEditor: panelEditorReducer,
};

