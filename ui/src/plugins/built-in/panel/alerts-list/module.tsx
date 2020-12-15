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
    // .addSelect({
    //   path: 'sortOrder',
    //   name: 'Sort order',
    //   description: 'how to sort alerts',
    //   defaultValue: 1,
    //   category: ['Options'],
    //   settings: {
    //     options: [
    //       { label: 'Date desc', value: 1 },
    //       { label: 'Date asc', value: 2 },
    //     ]
    //   }
    // })
    
    .addTextInput({
      path: 'dahUID',
      name: 'Dashboard uid',
      category: ['Options'],
      description: `filter by dashboard uid list, eg : u1dsf,1diisf`,
      defaultValue: '',
    })
    .addCustomEditor({
      id: 'alerts-list-team-picker',
      path: "teams",
      description: `filter by teams`,
      name: 'Team',
      category: ['Options'],
      defaultValue: [0],
      editor: TeamEditor
    })

    .addBooleanSwitch({
      path: 'currentTimeRange',
      description: 'whether to use current time range',
      category: ['Options'],
      name: 'Current time range',
      defaultValue: false,
    })
    // .addBooleanSwitch({
    //   path: 'filter.alerting',
    //   description: 'show alerts that has alerting state',
    //   category: ['Filter'],
    //   name: 'Alerting',
    //   defaultValue: true,
    // })
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