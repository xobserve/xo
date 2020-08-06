import React from 'react';
import {Row, Button,Radio} from 'antd'
import {CloseOutlined} from '@ant-design/icons'
import { Field } from '../Form/Field';
import { Input } from '../Form/Legacy/Input/Input';
import {Label} from '../Form/Label'

import { MappingType, RangeMap, SelectableValue, ValueMap, ValueMapping } from '../../../data';

export interface Props {
  valueMapping: ValueMapping;
  updateValueMapping: (valueMapping: ValueMapping) => void;
  removeValueMapping: () => void;
}

const MAPPING_OPTIONS: Array<SelectableValue<MappingType>> = [
  { value: MappingType.ValueToText, label: 'Value' },
  { value: MappingType.RangeToText, label: 'Range' },
];

export const MappingRow: React.FC<Props> = ({ valueMapping, updateValueMapping, removeValueMapping }) => {
  const { type } = valueMapping;

  const onMappingValueChange = (value: string) => {
    updateValueMapping({ ...valueMapping, value: value });
  };

  const onMappingFromChange = (value: string) => {
    updateValueMapping({ ...valueMapping, from: value });
  };

  const onMappingToChange = (value: string) => {
    updateValueMapping({ ...valueMapping, to: value });
  };

  const onMappingTextChange = (value: string) => {
    updateValueMapping({ ...valueMapping, text: value });
  };

  const onMappingTypeChange = (mappingType: MappingType) => {
    updateValueMapping({ ...valueMapping, type: mappingType });
  };

  const onKeyDown = (handler: (value: string) => void) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handler(e.currentTarget.value);
    }
  };

  const renderRow = () => {
    if (type === MappingType.RangeToText) {
      return (
        <>
          <Row>
            <Field label="From">
              <Input
                type="number"
                defaultValue={(valueMapping as RangeMap).from!}
                onBlur={e => onMappingFromChange(e.currentTarget.value)}
                onKeyDown={onKeyDown(onMappingFromChange)}
              />
            </Field>
            <Field label="To">
              <Input
                type="number"
                defaultValue={(valueMapping as RangeMap).to}
                onBlur={e => onMappingToChange(e.currentTarget.value)}
                onKeyDown={onKeyDown(onMappingToChange)}
              />
            </Field>
          </Row>

          <Field label="Text">
            <Input
              defaultValue={valueMapping.text}
              onBlur={e => onMappingTextChange(e.currentTarget.value)}
              onKeyDown={onKeyDown(onMappingTextChange)}
            />
          </Field>
        </>
      );
    }

    return (
      <>
        <Field label="Value">
          <Input
            type="number"
            defaultValue={(valueMapping as ValueMap).value}
            onBlur={e => onMappingValueChange(e.currentTarget.value)}
            onKeyDown={onKeyDown(onMappingValueChange)}
          />
        </Field>

        <Field label="Text">
          <Input
            defaultValue={valueMapping.text}
            onBlur={e => onMappingTextChange(e.currentTarget.value)}
            onKeyDown={onKeyDown(onMappingTextChange)}
          />
        </Field>
      </>
    );
  };

  const label = (
    <Row justify="space-between" align="middle">
      <Label>Mapping type</Label>
      <Button  icon={<CloseOutlined/>} onClick={removeValueMapping} aria-label="ValueMappingsEditor remove button" />
    </Row>
  );
  return (
    <div>
      <Field label={label}>
        <Radio.Group
          options={MAPPING_OPTIONS as any}
          value={type}
          onChange={e => {
            onMappingTypeChange(e.target.value!);
          }}
        />
      </Field>
      {renderRow()}
    </div>
  );
};
