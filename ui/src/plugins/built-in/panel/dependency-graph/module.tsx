import React, { useState } from 'react'
import _ from 'lodash'

import { PanelPlugin } from 'src/packages/datav-core';
import { DependencyGraphOptions } from './types';
import DependencyGraph from './DependencyGraph';
import { Input, Select, Button, Divider, notification } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
const { Option } = Select

export const plugin = new PanelPlugin<DependencyGraphOptions>(DependencyGraph).setPanelOptions(builder => {
  return builder
    .addTextInput({
      path: "dataMapping.sourceComponentPrefix",
      name: 'Source Component Column Prefix',
      category: ['Options', 'Connection Mapping'],
      defaultValue: 'origin_',
    })
    .addTextInput({
      path: "dataMapping.targetComponentPrefix",
      name: 'Target Component Column Prefix',
      category: ['Options'],
      defaultValue: 'target_',
    })
    .addTextInput({
      path: "dataMapping.type",
      name: 'Type',
      category: ['Options'],
      defaultValue: 'type',
    })
    .addTextInput({
      path: "dataMapping.extOrigin",
      name: 'External Origin',
      category: ['Options'],
      defaultValue: 'external_origin',
    })
    .addTextInput({
      path: "dataMapping.extTarget",
      name: 'External Target',
      category: ['Options'],
      defaultValue: 'external_target',
    })

    .addTextInput({
      path: "dataMapping.responseTimeColumn",
      name: 'Response Time Column',
      category: ['Options', 'Data Mapping'],
      defaultValue: 'response-time',
    })
    .addTextInput({
      path: "dataMapping.requestRateColumn",
      name: 'Request Rate Column',
      category: ['Options'],
      defaultValue: 'request-rate',
    })
    .addTextInput({
      path: "dataMapping.errorRateColumn",
      name: 'Error Rate Column',
      category: ['Options'],
      defaultValue: 'error-rate',
    })
    .addTextInput({
      path: "dataMapping.responseTimeOutgoingColumn",
      name: 'Response Time Column (Outgoing)',
      category: ['Options'],
      defaultValue: 'response-time-out',
    })
    .addTextInput({
      path: "dataMapping.requestRateOutgoingColumn",
      name: 'Request Rate Column (Outgoing)',
      category: ['Options'],
      defaultValue: 'request-rate-out',
    })
    .addTextInput({
      path: "dataMapping.errorRateOutgoingColumn",
      name: 'Error Rate Column (Outgoing)',
      category: ['Options'],
      defaultValue: 'error-rate-out',
    })
    .addTextInput({
      path: "dataMapping.baselineRtUpper",
      name: 'Response Time Baseline (Upper)',
      category: ['Options'],
      defaultValue: 'threshold',
    })

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
});

const ServiceEditor = props => {
  let value = props.value
  if (!props.value) {
    value = props.item.defaultValue
  }

  const [tempService,setTempService] = useState(null)
  const [tempIcon,setTempIcon] = useState(null)

  const onAddService = () => {
    if (props.value[tempService]) {
      notification['error']({
        message: "Error",
        description: "A same service already exist",
        duration: 5
      });
      return 
    }

    props.onChange({
      ...props.value,
      [tempService]: tempIcon
    })

    setTempService(null)
    setTempIcon(null)
  }

  const onDelService = (service) => {
    const value = _.cloneDeep(props.value)
    delete value[service]
    props.onChange(value)
  }

  const services = _.keys(value)
  return (
    <>
      <div className="gf-form-inline">
        <div className="gf-form">
          <label className="gf-form-label width-8">Target Type</label>
          <label className="gf-form-label width-8">Icon</label>
        </div>
        {
          services.map((service) => <div className="gf-form-inline" key={service}>
            <div className="gf-form">
              <Input className="gf-form-input width-8" value={service} disabled={service != ''} />
              <Select className="width-8" value={props.value && props.value[service]} onChange={(v) => props.onChange({...props.value, [service]: v})}>{getIconOptions().map(icon => <Option value={icon} key={icon}>{icon}</Option>)}</Select>
              <CloseOutlined onClick={() => onDelService(service)} className="ub-ml2 gf-form-label"/>
            </div>
          </div>)
        }
        {
           tempService !==  null && <>
              <Divider />
              <div className="gf-form">
                <Input className="gf-form-input width-8" value={tempService} onChange={(e) => setTempService(e.currentTarget.value)}/>
                <Select className="width-8" value={tempIcon} onChange={(v) => setTempIcon(v)}>{getIconOptions().map(icon => <Option value={icon} key={icon}>{icon}</Option>)}</Select>
                <PlusOutlined onClick={onAddService} className="ub-ml2 gf-form-label"/>
                <CloseOutlined onClick={() => {setTempService(null);setTempIcon(null)}} className="gf-form-label"/>
              </div>
            </>
        }
        {tempService === null && <Button type="primary" onClick={() => {setTempService('YOUR TYPE');setTempIcon('default')}}>Add new mappting</Button>}
      </div>
    </>
  );
}

function getIconOptions() {
  return ['default', 'message', 'database', 'http', 'web', 'balancer', 'ldap', 'mainframe', 'smtp', 'ftp'];
}