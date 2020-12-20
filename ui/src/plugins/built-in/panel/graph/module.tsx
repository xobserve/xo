import React from 'react'
import _ from 'lodash'
import { PanelPlugin ,TagsInput, localeData, currentLang, CodeEditor} from 'src/packages/datav-core/src';
import { GraphPanelOptions } from './types';
import { GraphPanel } from './GraphPanel';
import {ThresholdsEditor} from './ThresholdsEditor/ThresholdsEditor'

export const plugin = new PanelPlugin<GraphPanelOptions>(GraphPanel)
  .setPanelOptions(builder => {
    builder
    .addBooleanSwitch({
      path: 'lines',
      name: 'Lines',
      description: localeData[currentLang]['datasource.promLineTips'],
      defaultValue: true
    })
    .addSelect({
      path: 'linewidth',
      name: 'Line Width',
      description:localeData[currentLang]['datasource.promLineWidthTips'],
      defaultValue: '1',
      settings: {
        options: poitsRadiusOptions()
      },
      showIf: options => options.lines === true
    })
    .addSelect({
      path: 'fill',
      name: 'Area Fill',
      description:localeData[currentLang]['datasource.promAreaFillTips'],
      defaultValue: '1',
      settings: {
        options: poitsRadiusOptions()
      },
      showIf: options => options.lines === true
    })
    .addSelect({
      path: 'fillGradient',
      name: 'Fill Gradient',
      description:localeData[currentLang]['datasource.promFillGradientTips'],
      defaultValue: '5',
      settings: {
        options: poitsRadiusOptions()
      },
      showIf: options => options.lines === true
    })
    .addBooleanSwitch({
      path: 'steppedLine',
      name: 'Staircase',
      description: localeData[currentLang]['datasource.promStairCaseTips'],
      defaultValue:false,
      showIf: options => options.lines === true
    })
    .addBooleanSwitch({
      path: 'bars',
      name: 'Bars',
      description: localeData[currentLang]['datasource.promBarTips'],
      defaultValue:false
    })
    .addBooleanSwitch({
      path: 'points',
      name: 'Points',
      description:localeData[currentLang]['datasource.promPointTips'],
      defaultValue: false
    }) 
    .addSelect({
      path: 'pointradius',
      name: 'Point Radius',
      description: localeData[currentLang]['datasource.promPointRadiusTips'],
      defaultValue: '1',
      settings: {
        options: poitsRadiusOptions()
      },
      showIf: options => options.points === true
    })
    .addBooleanSwitch({
      path: 'stack',
      name: 'Stack',
      description: localeData[currentLang]['datasource.promStackTips'],
      defaultValue: false
    }) 
    .addBooleanSwitch({
      path: 'percentage',
      name: 'Stack Percentage',
      description: localeData[currentLang]['datasource.promStackPerTips'],
      defaultValue: false,
      showIf: options => options.stack === true
    }) 
    .addSelect({
      path: 'nullPointMode',
      name: 'Null Value',
      description: localeData[currentLang]['datasource.promNullTips'],
      defaultValue: 'null',
      settings: {
        options: [
          {value: 'null', label:'null'},
          {value: 'connected',label:'connected'},
          {value: 'null as zero',label:'null as zero'},
        ]
      }
    })
    .addNumberInput({
      path: 'decimals',
      name: 'Decimals',
      description: localeData[currentLang]['datasource.promDecimalTips'],
      settings: {
        placeholder: 'auto'
      },
      defaultValue: 2
    })
    .addRadio({
      path: 'tooltip.shared',
      name: 'Hover Tooltip Mode',
      description: localeData[currentLang]['datasource.promTooltipMode'],
      defaultValue: true,
      settings: {
        options: [
          //@ts-ignore
          {value: true, label:'All series'},
          //@ts-ignore
          {value: false,label:'Single'}
        ]
      }
    })
    .addRadio({
      path: 'tooltip.sort',
      name: 'Hover Tooltip Sort Order',
      description: localeData[currentLang]['datasource.promTooltipOrder'],
      defaultValue: 2,
      settings: {
        options: [
          {value: 0, label:'None'},
          {value: 1,label:'Increasing'},
          {value: 2,label:'Decreasing'}
        ]
      }
    })
    .addRadio({
      path: 'tooltip.value_type',
      name: 'Hover Tooltip Stacked Value',
      description: localeData[currentLang]['datasource.promTooltipStack'],
      defaultValue: 'individual',
      settings: {
        options: [
          {value: 'individual', label:'individual'},
          {value: 'cumulative',label:'cumulative'},
        ]
      },
      showIf: options => options.stack === true
    })
    // Axes
    // Left Y
    .addBooleanSwitch({
      path: 'yaxes[0].show',
      name: 'Show',
      category: [localeData[currentLang]['common.axes'],localeData[currentLang]['common.leftY']],
      defaultValue: true,
    })
    .addUnitPicker({
      path: 'yaxes[0].format',
      name: 'Unit',
      description: localeData[currentLang]['datasource.promUnitTips'],
      category: [localeData[currentLang]['common.axes']],
      defaultValue: 'short'
    })
    .addSelect({
      path: 'yaxes[0].logBase',
      name: 'Scale',
      description: localeData[currentLang]['datasource.promScaleTips'],
      category: [localeData[currentLang]['common.axes']],
      defaultValue: 1,
      settings: {
        options: [
          {value: 1, label:'linear'},
          {value: 2, label:'log (base 2)'},
          {value: 10, label:'log (base 10)'},
          {value: 32, label:'log (base 32)'},
          {value: 1024, label:'log (base 1024)'},
        ]
      }
    })
    .addNumberInput({
      path: 'yaxes[0].min',
      name: 'Y-Min',
      description: localeData[currentLang]['datasource.promMinYTips'],
      category: [localeData[currentLang]['common.axes']],
      settings: {
        placeholder: 'auto'
      },
    })
    .addNumberInput({
      path: 'yaxes[0].max',
      name: 'Y-Max',
      description: localeData[currentLang]['datasource.promMaxYTips'],
      category: [localeData[currentLang]['common.axes']],
      settings: {
        placeholder: 'auto'
      },
    })
    .addTextInput({
      path: 'yaxes[0].label',
      name: 'Label',
      category: [localeData[currentLang]['common.axes']],
      defaultValue: '',
    })
     // Right Y
     .addBooleanSwitch({
      path: 'yaxes[1].show',
      name: 'Show',
      category: [localeData[currentLang]['common.axes'],localeData[currentLang]['common.rightY']],
      defaultValue: true,
    })
    .addUnitPicker({
      path: 'yaxes[1].format',
      name: 'Unit',
      description: localeData[currentLang]['datasource.promUnitTips'],
      category: [localeData[currentLang]['common.axes']],
      defaultValue: 'short'
    })
    .addSelect({
      path: 'yaxes[1].logBase',
      name: 'Scale',
      description: localeData[currentLang]['datasource.promScaleTips'],
      category: [localeData[currentLang]['common.axes']],
      defaultValue: 1,
      settings: {
        options: [
          {value: 1, label:'linear'},
          {value: 2, label:'log (base 2)'},
          {value: 10, label:'log (base 10)'},
          {value: 32, label:'log (base 32)'},
          {value: 1024, label:'log (base 1024)'},
        ]
      }
    })
    .addNumberInput({
      path: 'yaxes[1].min',
      name: 'Y-Min',
      description: localeData[currentLang]['datasource.promMinYTips'],
      category: [localeData[currentLang]['common.axes']],
      settings: {
        placeholder: 'auto'
      },
    })
    .addNumberInput({
      path: 'yaxes[1].max',
      name: 'Y-Max',
      description: localeData[currentLang]['datasource.promMaxYTips'],
      category: [localeData[currentLang]['common.axes']],
      settings: {
        placeholder: 'auto'
      },
    })
    .addTextInput({
      path: 'yaxes[1].label',
      name: 'Label',
      category: [localeData[currentLang]['common.axes']],
      defaultValue: '',
    })
    // X 
    .addBooleanSwitch({
      path: 'xaxis.show',
      name: 'Show',
      category: [localeData[currentLang]['common.axes'],localeData[currentLang]['common.xAxe']],
      defaultValue: true,
    })
    // Legent
    // Options
    .addBooleanSwitch({
      path: 'legend.show',
      name: 'Show',
      category: ['Legend','Options'],
      defaultValue: true,
    })
    .addBooleanSwitch({
      path: 'legend.alignAsTable',
      name: 'As table',
      category: ['Legend'],
      defaultValue: true,
    })
    .addBooleanSwitch({
      path: 'legend.rightSide',
      name: 'To the right',
      category: ['Legend'],
      defaultValue: false,
    })
    .addNumberInput({
      path: 'legend.sideWidth',
      name: 'Width',
      category: ['Legend'],
      settings: {
        placeholder: 'auto'
      },
    })
    // Values
    .addBooleanSwitch({
      path: 'legend.current',
      name: 'Current',
      category: ['Legend','Values'],
      defaultValue: true,
    })
    .addBooleanSwitch({
      path: 'legend.min',
      name: 'Min',
      category: ['Legend'],
      defaultValue: false,
    })
    .addBooleanSwitch({
      path: 'legend.max',
      name: 'Max',
      category: ['Legend'],
      defaultValue: false,
    })
    .addBooleanSwitch({
      path: 'legend.avg',
      name: 'Avg',
      category: ['Legend'],
      defaultValue: false,
    })
    // hide serries
    .addBooleanSwitch({
      path: 'legend.hideEmpty',
      name: 'With only nulls',
      category: ['Legend','Hide series'],
      defaultValue: false,
    })
    .addBooleanSwitch({
      path: 'legend.hideZero',
      name: 'With only zeros',
      category: ['Legend'],
      defaultValue: false,
    })
    .addCustomEditor({
      id: 'graph-thresholds',
      path: 'thresholds',
      name: '',
      description: '',
      category: ['Thresholds'],
      editor: ThresholdsEditor as any
    })
    .addBooleanSwitch({
      path: 'enableClickEvent',
      name: 'Enable click event',
      category: ['Click event'],
      description: "When enabled, click on graph point/serries will trigger a event",
      defaultValue: false
    })
    .addCustomEditor({
      id: 'graph-click-event-editor',
      path: "clickEvent",
      name: 'Event editor',
      category: ['Click event'],
      defaultValue: ``,
      editor: OptionEditor,
      showIf:  options => options.enableClickEvent === true
    })
    .addDataLinks({
       path: 'options.dataLinks',
       name: 'Link list',
       category: ['Data links']
    })
  })

const poitsRadiusOptions = () => {
  let r = []
  for (var i=0;i<=10;i++) {
    r.push({value:i,label:i.toString()})
  }

  return r
}


const OptionEditor = props => {
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