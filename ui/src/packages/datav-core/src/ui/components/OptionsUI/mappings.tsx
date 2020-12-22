import React from 'react';

import { FieldConfigEditorProps, ValueMapping, ValueMappingFieldConfigSettings } from '../../../data';
import { ValueMappingsEditor } from '../ValueMappingsEditor/ValueMappingsEditor';

export class ValueMappingsValueEditor extends React.PureComponent<
  FieldConfigEditorProps<ValueMapping[], ValueMappingFieldConfigSettings>
> {
  render() {
    const { onChange } = this.props;
    let value = this.props.value;
    if (!value) {
      value = [];
    }

    return <ValueMappingsEditor valueMappings={value} onChange={onChange} />;
  }
}
