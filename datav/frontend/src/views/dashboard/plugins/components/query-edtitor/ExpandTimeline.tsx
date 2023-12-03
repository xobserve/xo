// Copyright 2023 xObserve.io Team

import FormItem from 'components/form/Item'
import RadionButtons from 'components/RadioButtons'
import { cloneDeep } from 'lodash'
import React from 'react'

const ExpandTimeline = ({ t1, tempQuery, setTempQuery, onChange }) => {
  return (
    <FormItem
      labelWidth='150px'
      size='sm'
      title={t1.expandTimeline}
      desc={t1.expandTimelineDesc}
    >
      <RadionButtons
        size='sm'
        options={[
          { label: 'Auto', value: 'auto' },
          { label: 'Always', value: 'always' },
          { label: 'None', value: 'none' },
        ]}
        value={tempQuery.data['expandTimeline']}
        onChange={(v) => {
          tempQuery.data['expandTimeline'] = v
          const q = { ...tempQuery, data: cloneDeep(tempQuery.data) }
          setTempQuery(q)
          onChange(q)
        }}
      />
    </FormItem>
  )
}

export default ExpandTimeline
