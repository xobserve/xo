// Copyright 2023 xobserve.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
