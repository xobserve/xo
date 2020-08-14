import React, { FunctionComponent, useMemo } from 'react';
import { VariableHide, VariableModel } from 'src/types';
import { variableAdapters } from '../adapters';
import { Tooltip } from 'antd'
interface Props {
  variable: VariableModel;
}

export const PickerRenderer: FunctionComponent<Props> = props => {
  const PickerToRender = useMemo(() => variableAdapters.get(props.variable.type).picker, [props.variable]);
  const labelOrName = useMemo(() => props.variable.label || props.variable.name, [props.variable]);

  if (!props.variable) {
    return <div>Couldn't load variable</div>;
  }

  const label = <label
    className="gf-form-label gf-form-label--variable"
  >
    {labelOrName}
  </label>

  const labelName = props.variable.global ?
    <Tooltip title="This variable is global visible">
      {label}
    </Tooltip> :
    label


  return (
    <div className="gf-form">
      {props.variable.hide === VariableHide.dontHide && labelName}
      {props.variable.hide !== VariableHide.hideVariable && PickerToRender && (
        <PickerToRender variable={props.variable} />
      )}
    </div>
  );
};
