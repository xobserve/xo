//@ts-nocheck
import cloneDeep from 'lodash/cloneDeep';
import omit from 'lodash/omit';

import {
  fieldReducers,
  Threshold,
  sortThresholds,
  FieldConfig,
  ReducerID,
  ValueMapping,
  MappingType,
  VizOrientation,
  PanelModel,
  ReduceDataOptions,
  ThresholdsMode,
  ThresholdsConfig,
  validateFieldConfig,
  FieldColorMode,
} from '../../../data';

export interface SingleStatBaseOptions {
  reduceOptions: ReduceDataOptions;
  orientation: VizOrientation;
}

const optionsToKeep = ['reduceOptions', 'orientation'];

export function sharedSingleStatPanelChangedHandler(
  panel: PanelModel<Partial<SingleStatBaseOptions>> | any,
  prevOptions: any
) {
  let options = panel.options;

  panel.fieldConfig = panel.fieldConfig || {
    defaults: {},
    overrides: [],
  };


  for (const k of optionsToKeep) {
    if (prevOptions.hasOwnProperty(k)) {
      options[k] = cloneDeep(prevOptions[k]);
    }
  }

  return options;
}


