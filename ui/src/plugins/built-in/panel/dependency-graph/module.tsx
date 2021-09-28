import React, { useState } from 'react'
import _ from 'lodash'

import { PanelPlugin} from 'src/packages/datav-core/src';
import { CodeEditor} from 'src/packages/datav-core/src/ui';
import { DependencyGraphOptions,ConditionMetric} from './types';
import DependencyGraph, {serviceIcons} from './DependencyGraph';
import { Input, Select, Button, Divider, notification } from 'antd';

import {editOptions}  from './layoutOptions'
import styleOptions from './styleOptions'
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select
const { REQUESTS, ERRORS, ERRORS_RATE, RESP_TIME } = ConditionMetric

export const plugin = new PanelPlugin<DependencyGraphOptions>(DependencyGraph).setPanelOptions(builder => {
  return builder
    .addTextInput({
      path: "dataMapping.source",
      name: 'Source Service Column',
      category: ['Options', 'Connection Mapping'],
      defaultValue: 'source',
    })
    .addTextInput({
      path: "dataMapping.target",
      name: 'Target Service Column',
      category: ['Options'],
      defaultValue: 'target',
    })
    .addTextInput({
      path: "dataMapping.externalType",
      name: 'External Type',
      category: ['Options'],
      defaultValue: 'external_type',
    })

    .addTextInput({
      path: "dataMapping.responseTimeColumn",
      name: 'Response Time Column',
      category: ['Options', 'Data Mapping'],
      defaultValue: 'response_time',
    })
    .addTextInput({
      path: "dataMapping.requestColumn",
      name: 'Requests Column',
      category: ['Options'],
      defaultValue: 'requests',
    })
    .addTextInput({
      path: "dataMapping.errorsColumn",
      name: 'Errors Column',
      category: ['Options'],
      defaultValue: 'errors',
    })
    // .addTextInput({
    //   path: "dataMapping.baselineRtUpper",
    //   name: 'Response Time Baseline (Upper)',
    //   category: ['Options'],
    //   defaultValue: 'threshold',
    // })

    .addBooleanSwitch({
      path: 'showConnectionStats',
      name: 'Show Connection Statistics',
      category: ['Options', 'General Settings'],
      defaultValue: true,
    })
    .addBooleanSwitch({
      path: 'sumTimings',
      name: 'Handle Timings as Sums',
      category: ['Options'],
      description: `If this
      setting is active, the timings provided by the mapped response time columns are considered as a
      continually increasing sum of response times. When deactivated, it is considered that the
      timings provided by columns are the actual average response times.`,
      defaultValue: true,
    })
    .addBooleanSwitch({
      path: 'filterEmptyConnections',
      name: 'Filter Empty Data',
      category: ['Options'],
      description: `When enabled,
      the graph will only show connections and nodes which have a in or out rate higher than zero.`,
      defaultValue: true,
    })
    .addBooleanSwitch({
      path: 'showDebugInformation',
      name: 'Show Debug Information',
      category: ['Options'],
      defaultValue: false,
    })
    .addBooleanSwitch({
      path: 'showDummyData',
      name: 'Show Dummy Data',
      category: ['Options'],
      defaultValue: false,
    })


    .addSelect({
      path: 'threshold.type',
      name: 'Threshold type',
      category: ['Options','Threshold'],
      defaultValue: null,
      settings: {
        options: [
          {value: REQUESTS, label: REQUESTS},
          {value: ERRORS, label:ERRORS},
          {value: ERRORS_RATE, label: ERRORS_RATE},
          {value: RESP_TIME, label:RESP_TIME},
          {value: null, label: "Disable"},
        ]
      }
    })
    .addNumberInput({
      path: 'threshold.value',
      name: 'Threshold value',
      category: ['Options'],
      defaultValue: 0,
    })
    .addBooleanSwitch({
      path: 'showBaselines',
      name: 'Show Baselines',
      category: ['Options'],
      defaultValue: false,
    })
    .addColorPicker({
      path: "style.healthyColor",
      name: 'Healthy Color',
      category: ['Options', 'Appearance'],
      defaultValue: 'rgb(87, 148, 242)'
    })
    .addColorPicker({
      path: "style.dangerColor",
      name: 'Danger Color',
      category: ['Options'],
      defaultValue: 'rgb(184, 36, 36)'
    })
    .addColorPicker({
      path: "style.unknownColor",
      name: 'No Data Color',
      category: ['Options'],
      defaultValue: 'rgb(123, 123, 138)'
    })

    .addCustomEditor({
      id: 'dependency-service-icon',
      path: "serviceIcons",
      name: null,
      category: ['Options', 'Service Icon Mapping'],
      defaultValue: {
        web: 'web',
      },
      editor: ServiceEditor
    })

    .addTextInput({
      path: "drillDownLink",
      name: "URL",
      category: ['Options','Tracing Drilldown'],
      defaultValue: '',
      description: 'This URL will be used as a drilldown URL for selected service nodes, You can use variables , you can also use {} for selected node id,'
    })

    .addCustomEditor({
      id: 'dependency-layout-setting',
      path: "layoutSetting",
      name: 'Layout setting',
      category: ['Layout and Style'],
      defaultValue: JSON.stringify(editOptions, null, 2),
      editor: OptionEditor
    })

    .addCustomEditor({
      id: 'dependency-style-setting',
      path: "styleSetting",
      name: 'Style setting',
      category: ['Layout and Style'],
      defaultValue: JSON.stringify(styleOptions,null,2),
      editor: OptionEditor
    })

    .addBooleanSwitch({
      path: 'enableClickEvent',
      name: 'Enable click event',
      category: ['Click event'],
      description: "When enabled, click on node will trigger a event",
      defaultValue: false
    })
    .addCustomEditor({
      id: 'dependency-graph-click-event-editor',
      path: "clickEvent",
      name: 'Event editor',
      category: ['Click event'],
      defaultValue: ``,
      editor: ClickEditor,
      showIf:  options => options.enableClickEvent === true
    })
});


 

const OptionEditor = props => {
  let value = _.cloneDeep(props.value) 
  if (!props.value) {
    value = _.cloneDeep(props.item.defaultValue)
  }

  const onDataChange = v => {
     props.onChange(v)
  }
  return (
      <CodeEditor
        width="100%"
        height="200px"
        language="json"
        showLineNumbers={true}
        showMiniMap={false}
        value={value}
        onBlur={(v) => onDataChange(v)}

      />
  )
}

const ServiceEditor = props => {
  let value = _.cloneDeep(props.value)
  if (!props.value) {
    value = _.cloneDeep(props.item.defaultValue)
  }

  const [tempService,setTempService] = useState(null)
  const [tempIcon,setTempIcon] = useState(null)

  const onAddService = () => {
    if (value[tempService]) {
      notification['error']({
        message: "Error",
        description: "A same service already exist",
        duration: 5
      });
      return 
    }

    props.onChange({
      ...value,
      [tempService]: tempIcon
    })

    setTempService(null)
    setTempIcon(null)
  }

  const onDelService = (service) => {
    delete value[service]
    props.onChange(value)
  }

  const services = _.keys(value)
  return (
    <>
      <div className="gf-form-inline">
        <div className="gf-form">
          <label className="gf-form-label width-8">Name (RegEx)</label>
          <label className="gf-form-label width-8">Icon</label>
        </div>
        {
          services.map((service) => <div className="gf-form-inline" key={service}>
            <div className="gf-form"> 
              <Input className="gf-form-input width-8" value={service} disabled={service != ''} />
              <Select className="width-8" value={value && value[service]} onChange={(v) => props.onChange({...value, [service]: v})}>{serviceIcons.map(icon => <Option value={icon} key={icon}>{icon}</Option>)}</Select>
              <CloseOutlined translate onClick={() => onDelService(service)} className="ub-ml2 gf-form-label"/>
            </div>
          </div>)
        }
        {
           tempService !==  null && <>
              <Divider />
              <div className="gf-form">
                <Input className="gf-form-input width-8" value={tempService} onChange={(e) => setTempService(e.currentTarget.value)}/>
                <Select className="width-8" value={tempIcon} onChange={(v) => setTempIcon(v)}>{serviceIcons.map(icon => <Option value={icon} key={icon}>{icon}</Option>)}</Select>
                <PlusOutlined translate onClick={onAddService} className="ub-ml2 gf-form-label"/>
                <CloseOutlined  translate onClick={() => {setTempService(null);setTempIcon(null)}} className="gf-form-label"/>
              </div>
            </>
        }
        {tempService === null && <Button type="primary" onClick={() => {setTempService('YOUR NAME');setTempIcon('default')}}>Add new mappting</Button>}
      </div>
    </>
  );
}


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