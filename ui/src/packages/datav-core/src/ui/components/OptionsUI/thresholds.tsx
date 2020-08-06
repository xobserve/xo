import React from 'react';
import { FieldConfigEditorProps, ThresholdsFieldConfigSettings, ThresholdsMode,ThresholdsConfig } from '../../../data';
import { ThresholdsEditor } from '../ThresholdsEditor/ThresholdsEditor';
 
export class ThresholdsValueEditor extends React.PureComponent<
  FieldConfigEditorProps<ThresholdsConfig, ThresholdsFieldConfigSettings>
> {
  render() {
    const { onChange } = this.props;
    let value = this.props.value;
    if (!value) { 
      value = {
        mode: ThresholdsMode.Percentage,
        // Must be sorted by 'value', first value is always -Infinity
        steps: [],
      };
    }
    return <ThresholdsEditor thresholds={value} onChange={onChange} />;
  }
}
