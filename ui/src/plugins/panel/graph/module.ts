import { PanelPlugin ,TagsInput} from 'src/packages/datav-core';
import { GraphPanelOptions } from './types';
import { GraphPanel } from './GraphPanel';
import {ThresholdsEditor} from './ThresholdsEditor/ThresholdsEditor'

export const plugin = new PanelPlugin<GraphPanelOptions>(GraphPanel)
  .setPanelOptions(builder => {
    builder
    .addBooleanSwitch({
      path: 'lines',
      name: 'Lines',
      description:'show/hide lines',
      defaultValue: true
    })
    .addSelect({
      path: 'linewidth',
      name: 'Line Width',
      description:'show/hide lines',
      defaultValue: '1',
      settings: {
        options: poitsRadiusOptions()
      },
      showIf: options => options.lines === true
    })
    .addSelect({
      path: 'fill',
      name: 'Area Fill',
      description:'fill factor of the graph area',
      defaultValue: '1',
      settings: {
        options: poitsRadiusOptions()
      },
      showIf: options => options.lines === true
    })
    .addSelect({
      path: 'fillGradient',
      name: 'Fill Gradient',
      description:'fill gradient of the graph area',
      defaultValue: '0',
      settings: {
        options: poitsRadiusOptions()
      },
      showIf: options => options.lines === true
    })
    .addBooleanSwitch({
      path: 'steppedLine',
      name: 'Staircase',
      description: 'line width in pixels',
      defaultValue:false,
      showIf: options => options.lines === true
    })
    .addBooleanSwitch({
      path: 'bars',
      name: 'Bars',
      description: 'show/hide bars',
      defaultValue:false
    })
    .addBooleanSwitch({
      path: 'points',
      name: 'Points',
      description:'show/hide points',
      defaultValue: false
    }) 
    .addSelect({
      path: 'pointradius',
      name: 'Point Radius',
      description: 'point radius in pixels',
      defaultValue: '1',
      settings: {
        options: poitsRadiusOptions()
      },
      showIf: options => options.points === true
    })
    .addBooleanSwitch({
      path: 'stack',
      name: 'Stack',
      defaultValue: false
    }) 
    .addBooleanSwitch({
      path: 'percentage',
      name: 'Stack Percentage',
      description: 'stack percentage mode',
      defaultValue: false,
      showIf: options => options.stack === true
    }) 
    .addSelect({
      path: 'nullPointMode',
      name: 'Null Value',
      description: 'how null points should be handled',
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
      description: 'Override automatic decimal precision for legend and tooltips',
      settings: {
        placeholder: 'auto'
      },
    })
    .addRadio({
      path: 'tooltip.shared',
      name: 'Hover Tooltip Mode',
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
      category: ['Axes','Left Y'],
      defaultValue: true,
    })
    .addUnitPicker({
      path: 'yaxes[0].format',
      name: 'Unit',
      category: ['Axes'],
      defaultValue: 'none'
    })
    .addSelect({
      path: 'yaxes[0].logBase',
      name: 'Scale',
      category: ['Axes'],
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
      category: ['Axes'],
      settings: {
        placeholder: 'auto'
      },
    })
    .addNumberInput({
      path: 'yaxes[0].max',
      name: 'Y-Max',
      category: ['Axes'],
      settings: {
        placeholder: 'auto'
      },
    })
    .addTextInput({
      path: 'yaxes[0].label',
      name: 'Label',
      category: ['Axes'],
      defaultValue: '',
    })
     // Right Y
     .addBooleanSwitch({
      path: 'yaxes[1].show',
      name: 'Show',
      category: ['Axes','Right Y'],
      defaultValue: true,
    })
    .addUnitPicker({
      path: 'yaxes[1].format',
      name: 'Unit',
      category: ['Axes'],
      defaultValue: 'none'
    })
    .addSelect({
      path: 'yaxes[1].logBase',
      name: 'Scale',
      category: ['Axes'],
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
      category: ['Axes'],
      settings: {
        placeholder: 'auto'
      },
    })
    .addNumberInput({
      path: 'yaxes[1].max',
      name: 'Y-Max',
      category: ['Axes'],
      settings: {
        placeholder: 'auto'
      },
    })
    .addTextInput({
      path: 'yaxes[1].label',
      name: 'Label',
      category: ['Axes'],
      defaultValue: '',
    })
    // X 
    .addBooleanSwitch({
      path: 'xaxis.show',
      name: 'Show',
      category: ['Axes','X-Axis'],
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
      defaultValue: false,
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
      category: ['Legend','Options'],
      defaultValue: false,
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
    .addDataLinks({
       path: 'options.dataLinks',
       name: 'Link list',
       category: ['Data links']
    })
  })

const poitsRadiusOptions = () => {
  let r = []
  for (var i=1;i<=10;i++) {
    r.push({value:i,label:i.toString()})
  }

  return r
}

