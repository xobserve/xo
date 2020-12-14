import React from 'react'
import { PanelPlugin } from 'src/packages/datav-core/src';
import _ from 'lodash'
import { AlertsListOptions } from './types';
import StarterPanel  from './AlertsList';
import TeamPicker from 'src/views/components/Pickers/TeamPicker';

export const plugin = new PanelPlugin<AlertsListOptions>(StarterPanel).setPanelOptions(builder => {
  return builder
    .addNumberInput({
      path: 'maxItems',
      name: 'Max items',
      category: ['Options'],
      description: 'max alert items  allowed showing in panel',
      defaultValue: 10,
    })
    .addSelect({
      path: 'sortOrder',
      name: 'Sort order',
      description: 'how to sort alerts',
      defaultValue: 1,
      category: ['Options'],
      settings: {
        options: [
          { label: 'Date desc', value: 1 },
          { label: 'Date asc', value: 2 },
        ]
      }
    })
    
    .addBooleanSwitch({
      path: 'filter.onlyAlertsOnDashboard',
      category: ['Filter'],
      name: 'Alerts from this dashboard',
      defaultValue: false,
    })
    .addTextInput({
      path: 'filter.alertName',
      name: 'Alert name',
      category: ['Filter'],
      description: 'alert name query',
      defaultValue: '',
    })
    .addCustomEditor({
      id: 'alerts-list-team-picker',
      path: "filter.teams",
      name: 'Team',
      category: ['Filter'],
      defaultValue: [0],
      editor: TeamEditor
    })

    .addBooleanSwitch({
      path: 'filter.ok',
      description: 'show alerts that has ok state',
      category: ['Filter'],
      name: 'OK',
      defaultValue: true,
    })
    .addBooleanSwitch({
      path: 'filter.alerting',
      description: 'show alerts that has alerting state',
      category: ['Filter'],
      name: 'Alerting',
      defaultValue: true,
    })
});


const TeamEditor = props => {
  let value = _.cloneDeep(props.value) 
  if (!props.value) {
    value = _.cloneDeep(props.item.defaultValue)
    props.onChange(value)
  }

  const onDataChange = v => {
     props.onChange(v)
  }
  
  return (
        <TeamPicker value={value} onChange={onDataChange} mutiple enableAll/>
  )
}