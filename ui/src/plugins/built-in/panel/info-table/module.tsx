import React from 'react'
import { PanelPlugin } from 'src/packages/datav-core/src';
import _ from 'lodash'
import { InfoTable } from './InfoTable';
import { CustomFieldConfig, Options } from './types';
import { TableCellDisplayMode,CodeEditor } from 'src/packages/datav-core/src/ui';

export const plugin = new PanelPlugin<Options, CustomFieldConfig>(InfoTable)
  .setNoPadding()
  .useFieldConfig({
    useCustomConfig: builder => {
      builder
        .addNumberInput({
          path: 'width',
          name: 'Column width',
          settings: {
            placeholder: 'auto',
            min: 20,
            max: 300,
          },
          shouldApply: () => true,
        })
        .addRadio({
          path: 'align',
          name: 'Column alignment',
          settings: {
            options: [
              { label: 'auto', value: null },
              { label: 'left', value: 'left' },
              { label: 'center', value: 'center' },
              { label: 'right', value: 'right' },
            ],
          },
          defaultValue: null,
        })
        .addSelect({
          path: 'displayMode',
          name: 'Cell display mode',
          description: 'Color text, background, show as gauge, etc',
          settings: {
            options: [
              { value: TableCellDisplayMode.Auto, label: 'Auto' },
              { value: TableCellDisplayMode.ColorText, label: 'Color text' },
              { value: TableCellDisplayMode.ColorBackground, label: 'Color background' },
            ],
          },
        })
    },
  })
  .setPanelOptions(builder => {
  });
