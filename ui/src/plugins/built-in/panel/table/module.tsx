import React from 'react'
import { PanelPlugin, CodeEditor } from 'src/packages/datav-core/src';
import _ from 'lodash'
import { TablePanel } from './TablePanel';
import { CustomFieldConfig, Options } from './types';
import { TableCellDisplayMode } from 'src/packages/datav-core/src';

export const plugin = new PanelPlugin<Options, CustomFieldConfig>(TablePanel)
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
              { value: TableCellDisplayMode.GradientGauge, label: 'Gradient gauge' },
              { value: TableCellDisplayMode.LcdGauge, label: 'LCD gauge' },
              { value: TableCellDisplayMode.JSONView, label: 'JSON View' },
            ],
          },
        })
        .addBooleanSwitch({
          path: 'filterable',
          name: 'Column filter',
          description: 'Enables/disables field filters in table',
          defaultValue: false,
        });
    },
  })
  .setPanelOptions(builder => {
    builder
      .addBooleanSwitch({
        path: 'showHeader',
        name: 'Show header',
        description: "To display table's header or not to display",
        defaultValue: true,
      })
      .addBooleanSwitch({
        path: 'enableRowClick',
        name: 'Enable row click',
        category: ['Row click'],
        description: "When enabled, click on table row will trigger a event",
        defaultValue: false
      })
      .addCustomEditor({
        id: 'table-row-click-editor',
        path: "rowClickEvent",
        name: 'Event editor',
        category: ['Row click'],
        defaultValue: `setVariable('test',data['0'])`,
        editor: ClickEditor,
        showIf:  options => options.enableRowClick === true
      })
  });


  const ClickEditor = props => {
    let value = _.cloneDeep(props.value) 
    if (!props.value) {
      value = _.cloneDeep(props.item.defaultValue)
    }
  
    const onDataChange = v => {
       props.onChange(v)
    }
    return (
      <div>
        <div>function(data, history, setVariable, setTime) <span className="color-primary">&nbsp;{` {`}</span></div>
           <CodeEditor
          width="100%"
          height="200px"
          language="javascript"
          showLineNumbers={true}
          showMiniMap={false}
          value={value}
          onBlur={(v) => onDataChange(v)}
  
        />
        <span className="color-primary">{` }`}</span>
      </div>
    )
  }