import React, { useCallback } from 'react';
import { FieldOverrideEditorProps, SelectableValue } from 'src/packages/datav-core/src';
import { GraphTresholdsStyleMode, Select } from 'src/packages/datav-core/src/ui';

export const ThresholdsStyleEditor: React.FC<
  FieldOverrideEditorProps<SelectableValue<{ mode: GraphTresholdsStyleMode }>, any>
> = ({ item, value, onChange }) => {
  const onChangeCb = useCallback(
    (v: SelectableValue<GraphTresholdsStyleMode>) => {
      onChange({
        mode: v.value,
      });
    },
    [onChange]
  );
  return <Select menuShouldPortal value={value.mode} options={item.settings.options} onChange={onChangeCb} />;
};
