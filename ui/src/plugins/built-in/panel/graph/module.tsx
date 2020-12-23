import React, { useState } from 'react'
import _, { over } from 'lodash'
import { PanelPlugin, localeData, currentLang, CodeEditor, FieldConfigProperty, Icon, Button, textUtil } from 'src/packages/datav-core/src';
import { GraphPanelOptions } from './types';
import { GraphPanel } from './GraphPanel';
import { ThresholdsEditor } from './ThresholdsEditor/ThresholdsEditor'
import { Cascader, Select } from 'antd';


export const plugin = new PanelPlugin<GraphPanelOptions>(GraphPanel)
  .useFieldConfig({
    standardOptions: [
      // FieldConfigProperty.Min,
      // FieldConfigProperty.Max,
      // FieldConfigProperty.Color,
      // FieldConfigProperty.Unit,
      FieldConfigProperty.DisplayName,
      // FieldConfigProperty.Decimals,
      // NOT:  FieldConfigProperty.Thresholds,
      // FieldConfigProperty.Mappings,
    ]
  }
  )
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
        description: localeData[currentLang]['datasource.promLineWidthTips'],
        defaultValue: '1',
        settings: {
          options: poitsRadiusOptions()
        },
        showIf: options => options.lines === true
      })
      .addSelect({
        path: 'fill',
        name: 'Area Fill',
        description: localeData[currentLang]['datasource.promAreaFillTips'],
        defaultValue: '1',
        settings: {
          options: poitsRadiusOptions()
        },
        showIf: options => options.lines === true
      })
      .addSelect({
        path: 'fillGradient',
        name: 'Fill Gradient',
        description: localeData[currentLang]['datasource.promFillGradientTips'],
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
        defaultValue: false,
        showIf: options => options.lines === true
      })
      .addBooleanSwitch({
        path: 'bars',
        name: 'Bars',
        description: localeData[currentLang]['datasource.promBarTips'],
        defaultValue: false
      })
      .addBooleanSwitch({
        path: 'points',
        name: 'Points',
        description: localeData[currentLang]['datasource.promPointTips'],
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
            { value: 'null', label: 'null' },
            { value: 'connected', label: 'connected' },
            { value: 'null as zero', label: 'null as zero' },
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
            { value: true, label: 'All series' },
            //@ts-ignore
            { value: false, label: 'Single' }
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
            { value: 0, label: 'None' },
            { value: 1, label: 'Increasing' },
            { value: 2, label: 'Decreasing' }
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
            { value: 'individual', label: 'individual' },
            { value: 'cumulative', label: 'cumulative' },
          ]
        },
        showIf: options => options.stack === true
      })
      // Axes
      // Left Y
      .addBooleanSwitch({
        path: 'yaxes[0].show',
        name: 'Show',
        category: [localeData[currentLang]['common.axes'], localeData[currentLang]['common.leftY']],
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
            { value: 1, label: 'linear' },
            { value: 2, label: 'log (base 2)' },
            { value: 10, label: 'log (base 10)' },
            { value: 32, label: 'log (base 32)' },
            { value: 1024, label: 'log (base 1024)' },
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
        category: [localeData[currentLang]['common.axes'], localeData[currentLang]['common.rightY']],
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
            { value: 1, label: 'linear' },
            { value: 2, label: 'log (base 2)' },
            { value: 10, label: 'log (base 10)' },
            { value: 32, label: 'log (base 32)' },
            { value: 1024, label: 'log (base 1024)' },
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
        category: [localeData[currentLang]['common.axes'], localeData[currentLang]['common.xAxe']],
        defaultValue: true,
      })
      // Legent
      // Options
      .addBooleanSwitch({
        path: 'legend.show',
        name: 'Show',
        category: ['Legend', 'Options'],
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
        category: ['Legend', 'Values'],
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
        category: ['Legend', 'Hide series'],
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
      .addCustomEditor({
        id: 'graph-series-override',
        path: 'seriesOverrides',
        name: '',
        category: ['Series Overrides'],
        defaultValue: [],
        editor: SeriesOverrides,
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
        showIf: options => options.enableClickEvent === true
      })
      .addDataLinks({
        path: 'options.dataLinks',
        name: 'Link list',
        category: ['Data links']
      })
  })

const poitsRadiusOptions = () => {
  let r = []
  for (var i = 0; i <= 10; i++) {
    r.push({ value: i, label: i.toString() })
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


const SeriesOverrides = props => {
  const [inSelecting, setInSelecting] = useState(false)

  let overrides: any[] = _.cloneDeep(props.value)
  if (!props.value) {
    overrides = _.cloneDeep(props.item.defaultValue)
  }

  console.log(overrides)

  const addOverride = () => {
    overrides.push({})
    props.onChange(overrides)
  }

  const deleteOverride = (i) => {
    overrides.splice(i, 1)
    props.onChange(overrides)
  }

  const setOverride = (override, v) => {
    override[v[0]] = v[1]
    props.onChange(overrides)
    setInSelecting(false)
  }


  return (
    <>
      {overrides.map((override, i) => <div className="graph-series-override" key={i}>
        <div className="gf-form">
          <label className="gf-form-label">Alias or regex</label>
          <input
            type="text"
            value={override.alias}
            className="gf-form-input width-15"
            placeholder="For regex use /pattern/"
            onChange={(e) => { override.alias = e.currentTarget.value; props.onChange(overrides) }}
          />
          <label className="gf-form-label pointer">
            <Icon name="trash-alt" onClick={() => deleteOverride(i)}></Icon>
          </label>
        </div>
        <div className="graph-series-override__properties">
          {
            _.map(override, (v, k) => {
              if (k != 'alias') {
                return <div className="gf-form" key={k}>
                  <label className="gf-form-label gf-form-label--grow">
                    <span> {k}: {v} </span>
                    <Icon
                      name="times"
                      size="sm"
                      onClick={() => { delete override[k]; props.onChange(overrides) }}
                      style={{ marginRight: '4px', cursor: 'pointer' }}
                    ></Icon>
                  </label>
                </div>
              }; return null
            })
          }

          <div className="gf-form">
            {
              inSelecting ?
                <Cascader options={overrideMenu} className="width-8" expandTrigger="hover" onChange={(v) => setOverride(override, v)} />
                :
                <Icon name="plus" className="gf-form-label width-2 pointer" onClick={() => setInSelecting(true)}></Icon>
            }


          </div>
        </div>
      </div>)}

      <div className="gf-form-button-row">
        <Button className="btn btn-inverse" variant="secondary" onClick={addOverride}>
          <Icon name="'plus'"></Icon>&nbsp;Add series override
      </Button>
      </div>
    </>
  );
}


const overrideMenu = [
  {
    value: 'bars', label: 'Bars', children: [{label: 'true', value: 'true'},{label: 'false',value: 'false'}]
  },
  {
    value: 'lines', label: 'Lines', children: [{label: 'true', value: 'true'},{label: 'false',value: 'false'}]
  },
  {
    value: 'fill', label: 'Fill', children: [{label: 0, value: 0},{label: 1,value: 1},{label: 2,value: 2},{label: 3,value: 3},{label: 4,value: 4},{label: 5,value: 5},{label: 6,value: 6},{label: 7,value: 7},{label: 8,value: 8},{label: 9,value: 9},{label: 10,value: 10}]
  },
  {
    value: 'fillGradient', label: 'Fill gradient', children: [{label: 0, value: 0},{label: 1,value: 1},{label: 2,value: 2},{label: 3,value: 3},{label: 4,value: 4},{label: 5,value: 5},{label: 6,value: 6},{label: 7,value: 7},{label: 8,value: 8},{label: 9,value: 9},{label: 10,value: 10}]
  },
  {
    value: 'linewidth', label: 'Line width', children: [{label: 0, value: 0},{label: 1,value: 1},{label: 2,value: 2},{label: 3,value: 3},{label: 4,value: 4},{label: 5,value: 5},{label: 6,value: 6},{label: 7,value: 7},{label: 8,value: 8},{label: 9,value: 9},{label: 10,value: 10}]
  },
  {
    value: 'nullPointMode', label: 'Null point mode', children: [{label: 'connected', value: 'connected'},{label: 'null',value: 'null'},{label: 'null as zero',value: 'null as zero'}]
  },
  {
    value: 'steppedLine', label: 'Staircase line', children: [{label: 'true', value: 'true'},{label: 'false',value: 'false'}]
  },
  {
    value: 'dashes', label: 'Dashes', children: [{label: 'true', value: 'true'},{label: 'false',value: 'false'}]
  },
  {
    value: 'hiddenSeries', label: 'Hidden Series', children: [{label: 'true', value: 'true'},{label: 'false',value: 'false'}]
  },
  {
    value: 'dashLength', label: 'Dash Length', children: [{label: 0, value: 0},{label: 1,value: 1},{label: 2,value: 2},{label: 3,value: 3},{label: 4,value: 4},{label: 5,value: 5},{label: 6,value: 6},{label: 7,value: 7},{label: 8,value: 8},{label: 9,value: 9},{label: 10,value: 10}]
  },
  {
    value: 'spaceLength', label: 'Dash Space', children: [{label: 0, value: 0},{label: 1,value: 1},{label: 2,value: 2},{label: 3,value: 3},{label: 4,value: 4},{label: 5,value: 5},{label: 6,value: 6},{label: 7,value: 7},{label: 8,value: 8},{label: 9,value: 9},{label: 10,value: 10}]
  },
  {
    value: 'points', label: 'Points', children: [{label: 'true', value: 'true'},{label: 'false',value: 'false'}]
  },
  {
    value: 'pointradius', label: 'Points Radius', children: [{label: 0, value: 0},{label: 1,value: 1},{label: 2,value: 2},{label: 3,value: 3},{label: 4,value: 4},{label: 5,value: 5}]
  },
  {
    value: 'stack', label: 'Stack', children: [{label: 'true', value: 'true'},{label: 'false',value: 'false'}]
  },
  {
    value: 'yaxis', label: 'Y-axis', children: [{label: 1, value: 1},{label: 2,value: 2}]
  },
  {
    value: 'zindex', label: 'Z-axis', children: [{label: -3,value: -3},{label: -2,value: -2},{label: -1,value: -1},{label: 0,value: 0},{label: 1, value: 1},{label: 2,value: 2},{label: 3,value: 3}]
  },
  {
    value: 'transform', label: 'Transform', children: [{label: 'constant', value: 'constant'},{label: 'negative-Y',value: 'negative-Y'}]
  },
  {
    value: 'legend', label: 'Legend', children: [{label: 'true', value: 'true'},{label: 'false',value: 'false'}]
  },
  {
    value: 'hideTooltip', label: 'Hide in tooltip', children: [{label: 'true', value: 'true'},{label: 'false',value: 'false'}]
  },
];