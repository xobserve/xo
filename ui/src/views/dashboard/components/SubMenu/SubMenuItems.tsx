import React, { FunctionComponent, useEffect, useState } from 'react';
import { VariableHide, VariableModel } from 'src/types';
import { PickerRenderer } from '../../../variables/pickers/PickerRenderer';
import { DashboardModel } from '../../model';

interface Props {
  dashboard: DashboardModel
  variables: VariableModel[];
}

export const SubMenuItems: FunctionComponent<Props> = ({ variables,dashboard}) => {
  const [visibleVariables, setVisibleVariables] = useState<VariableModel[]>([]);
  useEffect(() => {
    setVisibleVariables(variables.filter(state => state.hide !== VariableHide.hideVariable));
  }, [variables]);

  if (visibleVariables.length === 0) {
    return null;
  }

  return (
    <>
      {visibleVariables.map(variable => {
        const display =dashboard.variablesDiplay.indexOf(variable.name) === -1 
        return (
          <div
            key={variable.id}
            className="submenu-item gf-form-inline"
            style={{display: display? 'inline-block' : 'none'}}
          >
            <PickerRenderer variable={variable} />
          </div>
        );
      })}
    </>
  );
};
