import React from 'react'
import { currentLang, PanelPlugin } from 'src/packages/datav-core/src';
import _ from 'lodash'
import { AlertsListOptions } from './types';
import StarterPanel  from './AlertsList';
import TeamPicker from 'src/views/components/Pickers/TeamPicker';
import './locale'
import localeData from 'src/core/library/locale';

export const plugin = new PanelPlugin<AlertsListOptions>(StarterPanel).setPanelOptions(builder => {
  return builder
    .addNumberInput({
      path: 'maxItems',
      name: 'Max items',
      category: ['Options'],
      description: localeData[currentLang]['alertsList.maxItemTips'],
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
      description: localeData[currentLang]['alertsList.dashUidTips'],
      defaultValue: '',
    })
    .addCustomEditor({
      id: 'alerts-list-team-picker',
      path: "teams",
      description:localeData[currentLang]['alertsList.teamTips'],
      name: 'Team',
      category: ['Options'],
      defaultValue: [0],
      editor: TeamEditor
    })

    .addBooleanSwitch({
      path: 'currentTimeRange',
      description: localeData[currentLang]['alertsList.timeTips'],
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