import { AppEvents } from 'src/packages/datav-core/src';

import { toVariablePayload, VariableIdentifier } from '../state/types';
import { createIntervalOptions } from './reducer';
import { validateVariableSelectionState } from '../state/actions';
import { getVariable } from '../state/selectors';
import { IntervalVariableModel,ThunkResult } from 'src/types';
import kbn from 'src/core/library/utils/kbn';
import { getTimeSrv } from 'src/core/services/time';
import templateSrv from 'src/core/services/templating';
import appEvents from 'src/core/library/utils/app_events';

export interface UpdateIntervalVariableOptionsDependencies {
  appEvents: typeof appEvents;
}

export const updateIntervalVariableOptions = (
  identifier: VariableIdentifier,
  dependencies: UpdateIntervalVariableOptionsDependencies = { appEvents: appEvents }
): ThunkResult<void> => async dispatch => {
  try {
    await dispatch(createIntervalOptions(toVariablePayload(identifier)));
    await dispatch(updateAutoValue(identifier));
    await dispatch(validateVariableSelectionState(identifier));
  } catch (error) {
    dependencies.appEvents.emit(AppEvents.alertError, ['Templating', error.message]);
  }
};

export interface UpdateAutoValueDependencies {
  kbn: typeof kbn;
  getTimeSrv: typeof getTimeSrv;
  templateSrv: typeof templateSrv;
}

export const updateAutoValue = (
  identifier: VariableIdentifier,
  dependencies: UpdateAutoValueDependencies = {
    kbn: kbn,
    getTimeSrv: getTimeSrv,
    templateSrv: templateSrv,
  }
): ThunkResult<void> => (dispatch, getState) => {
  const variableInState = getVariable<IntervalVariableModel>(identifier.id, getState());
  if (variableInState.auto) {
    const res = dependencies.kbn.calculateInterval(
      dependencies.getTimeSrv().timeRange(),
      variableInState.auto_count,
      variableInState.auto_min
    );
    dependencies.templateSrv.setGrafanaVariable('$__auto_interval_' + variableInState.name, res.interval);
    // for backward compatibility, to be removed eventually
    dependencies.templateSrv.setGrafanaVariable('$__auto_interval', res.interval);
  }
};
