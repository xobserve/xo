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

import { Box, Text } from '@chakra-ui/react'
import React from 'react'
import countries from 'public/plugins/panel/geomap/countries.json'
import { Divider } from 'antd'
import ColumnResizableTable from 'components/table/ColumnResizableTable'

const TestPage = () => {
  const columns = ['ts_bucket', 'others', 'errors']
  const data = []
  const dataMap = {}
  d.data.forEach((r) => {
    const ts = Number(r.ts_bucket)
    if (!dataMap[ts]) {
      dataMap[ts] = {}
    }
    if (r.severity_group == 'error') {
      dataMap[ts]['errors'] = r.count ? Number(r.count) : null
    } else {
      dataMap[ts]['others'] = r.count ? Number(r.count) : null
    }
  })

  Object.keys(dataMap).forEach((k) => {
    data.push([k, dataMap[k]['others'], dataMap[k]['errors']])
  })

  data.sort((a, b) => {
    return a[0] - b[0]
  })

  console.log(
    'here333333:',
    JSON.stringify({
      columns,
      data,
    }),
  )
  return <></>
}
export default TestPage

const d = {
  meta: [
    {
      name: 'ts_bucket',
      type: 'UInt32',
    },
    {
      name: 'severity_group',
      type: 'String',
    },
    {
      name: 'count',
      type: 'UInt64',
    },
  ],
  data: [
    {
      ts_bucket: 1697689310,
      severity_group: 'info',
      count: '191',
    },
    {
      ts_bucket: 1697689320,
      severity_group: 'info',
      count: '149',
    },
    {
      ts_bucket: 1697689320,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697689330,
      severity_group: 'info',
      count: '141',
    },
    {
      ts_bucket: 1697689330,
      severity_group: 'error',
      count: '10',
    },
    {
      ts_bucket: 1697689340,
      severity_group: 'info',
      count: '262',
    },
    {
      ts_bucket: 1697689340,
      severity_group: 'error',
      count: '15',
    },
    {
      ts_bucket: 1697689350,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697689350,
      severity_group: 'info',
      count: '176',
    },
    {
      ts_bucket: 1697689360,
      severity_group: 'info',
      count: '204',
    },
    {
      ts_bucket: 1697689360,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697689370,
      severity_group: 'error',
      count: '15',
    },
    {
      ts_bucket: 1697689370,
      severity_group: 'info',
      count: '141',
    },
    {
      ts_bucket: 1697689380,
      severity_group: 'info',
      count: '214',
    },
    {
      ts_bucket: 1697689380,
      severity_group: 'error',
      count: '15',
    },
    {
      ts_bucket: 1697689390,
      severity_group: 'info',
      count: '122',
    },
    {
      ts_bucket: 1697689400,
      severity_group: 'error',
      count: '10',
    },
    {
      ts_bucket: 1697689400,
      severity_group: 'info',
      count: '219',
    },
    {
      ts_bucket: 1697689410,
      severity_group: 'info',
      count: '235',
    },
    {
      ts_bucket: 1697689410,
      severity_group: 'error',
      count: '15',
    },
    {
      ts_bucket: 1697689420,
      severity_group: 'error',
      count: '10',
    },
    {
      ts_bucket: 1697689420,
      severity_group: 'info',
      count: '229',
    },
    {
      ts_bucket: 1697689430,
      severity_group: 'info',
      count: '166',
    },
    {
      ts_bucket: 1697689430,
      severity_group: 'error',
      count: '10',
    },
    {
      ts_bucket: 1697689440,
      severity_group: 'info',
      count: '190',
    },
    {
      ts_bucket: 1697689440,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697689450,
      severity_group: 'info',
      count: '218',
    },
    {
      ts_bucket: 1697689450,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697689460,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697689460,
      severity_group: 'info',
      count: '152',
    },
    {
      ts_bucket: 1697689470,
      severity_group: 'info',
      count: '184',
    },
    {
      ts_bucket: 1697689480,
      severity_group: 'info',
      count: '299',
    },
    {
      ts_bucket: 1697689480,
      severity_group: 'error',
      count: '25',
    },
    {
      ts_bucket: 1697689490,
      severity_group: 'info',
      count: '216',
    },
    {
      ts_bucket: 1697689500,
      severity_group: 'info',
      count: '139',
    },
    {
      ts_bucket: 1697689500,
      severity_group: 'error',
      count: '10',
    },
    {
      ts_bucket: 1697689510,
      severity_group: 'info',
      count: '336',
    },
    {
      ts_bucket: 1697689510,
      severity_group: 'error',
      count: '25',
    },
    {
      ts_bucket: 1697689520,
      severity_group: 'info',
      count: '174',
    },
    {
      ts_bucket: 1697689530,
      severity_group: 'info',
      count: '138',
    },
    {
      ts_bucket: 1697689530,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697689540,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697689540,
      severity_group: 'info',
      count: '232',
    },
    {
      ts_bucket: 1697689550,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697689550,
      severity_group: 'info',
      count: '134',
    },
    {
      ts_bucket: 1697689560,
      severity_group: 'info',
      count: '212',
    },
    {
      ts_bucket: 1697689560,
      severity_group: 'error',
      count: '10',
    },
    {
      ts_bucket: 1697689570,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697689570,
      severity_group: 'info',
      count: '218',
    },
    {
      ts_bucket: 1697689580,
      severity_group: 'error',
      count: '10',
    },
    {
      ts_bucket: 1697689580,
      severity_group: 'info',
      count: '245',
    },
    {
      ts_bucket: 1697689590,
      severity_group: 'info',
      count: '154',
    },
    {
      ts_bucket: 1697689600,
      severity_group: 'info',
      count: '211',
    },
    {
      ts_bucket: 1697689600,
      severity_group: 'error',
      count: '15',
    },
    {
      ts_bucket: 1697689610,
      severity_group: 'info',
      count: '284',
    },
    {
      ts_bucket: 1697689610,
      severity_group: 'error',
      count: '15',
    },
    {
      ts_bucket: 1697689620,
      severity_group: 'info',
      count: '201',
    },
    {
      ts_bucket: 1697689620,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697689630,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697689630,
      severity_group: 'info',
      count: '251',
    },
    {
      ts_bucket: 1697689640,
      severity_group: 'info',
      count: '138',
    },
    {
      ts_bucket: 1697689650,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697689650,
      severity_group: 'info',
      count: '148',
    },
    {
      ts_bucket: 1697689660,
      severity_group: 'info',
      count: '135',
    },
    {
      ts_bucket: 1697689670,
      severity_group: 'info',
      count: '232',
    },
    {
      ts_bucket: 1697689670,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697689680,
      severity_group: 'info',
      count: '219',
    },
    {
      ts_bucket: 1697689680,
      severity_group: 'error',
      count: '10',
    },
    {
      ts_bucket: 1697689690,
      severity_group: 'info',
      count: '198',
    },
    {
      ts_bucket: 1697689700,
      severity_group: 'info',
      count: '243',
    },
    {
      ts_bucket: 1697689700,
      severity_group: 'error',
      count: '15',
    },
    {
      ts_bucket: 1697689710,
      severity_group: 'info',
      count: '131',
    },
    {
      ts_bucket: 1697689710,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697689720,
      severity_group: 'info',
      count: '189',
    },
    {
      ts_bucket: 1697689730,
      severity_group: 'info',
      count: '237',
    },
    {
      ts_bucket: 1697689730,
      severity_group: 'error',
      count: '20',
    },
    {
      ts_bucket: 1697689740,
      severity_group: 'info',
      count: '185',
    },
    {
      ts_bucket: 1697689750,
      severity_group: 'error',
      count: '10',
    },
    {
      ts_bucket: 1697689750,
      severity_group: 'info',
      count: '202',
    },
    {
      ts_bucket: 1697689760,
      severity_group: 'info',
      count: '160',
    },
    {
      ts_bucket: 1697689760,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697689770,
      severity_group: 'info',
      count: '144',
    },
    {
      ts_bucket: 1697689770,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697689780,
      severity_group: 'info',
      count: '254',
    },
    {
      ts_bucket: 1697689780,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697689790,
      severity_group: 'info',
      count: '184',
    },
    {
      ts_bucket: 1697689800,
      severity_group: 'info',
      count: '187',
    },
    {
      ts_bucket: 1697689810,
      severity_group: 'info',
      count: '154',
    },
    {
      ts_bucket: 1697689810,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697689820,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697689820,
      severity_group: 'info',
      count: '195',
    },
    {
      ts_bucket: 1697689830,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697689830,
      severity_group: 'info',
      count: '201',
    },
    {
      ts_bucket: 1697689840,
      severity_group: 'info',
      count: '160',
    },
    {
      ts_bucket: 1697689850,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697689850,
      severity_group: 'info',
      count: '194',
    },
    {
      ts_bucket: 1697689860,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697689860,
      severity_group: 'info',
      count: '187',
    },
    {
      ts_bucket: 1697689870,
      severity_group: 'error',
      count: '10',
    },
    {
      ts_bucket: 1697689870,
      severity_group: 'info',
      count: '213',
    },
    {
      ts_bucket: 1697689880,
      severity_group: 'info',
      count: '318',
    },
    {
      ts_bucket: 1697689880,
      severity_group: 'error',
      count: '10',
    },
    {
      ts_bucket: 1697689890,
      severity_group: 'error',
      count: '15',
    },
    {
      ts_bucket: 1697689890,
      severity_group: 'info',
      count: '244',
    },
    {
      ts_bucket: 1697689900,
      severity_group: 'info',
      count: '156',
    },
    {
      ts_bucket: 1697689900,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697689910,
      severity_group: 'error',
      count: '20',
    },
    {
      ts_bucket: 1697689910,
      severity_group: 'info',
      count: '284',
    },
    {
      ts_bucket: 1697689920,
      severity_group: 'info',
      count: '305',
    },
    {
      ts_bucket: 1697689920,
      severity_group: 'error',
      count: '10',
    },
    {
      ts_bucket: 1697689930,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697689930,
      severity_group: 'info',
      count: '159',
    },
    {
      ts_bucket: 1697689940,
      severity_group: 'error',
      count: '15',
    },
    {
      ts_bucket: 1697689940,
      severity_group: 'info',
      count: '243',
    },
    {
      ts_bucket: 1697689950,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697689950,
      severity_group: 'info',
      count: '184',
    },
    {
      ts_bucket: 1697689960,
      severity_group: 'info',
      count: '204',
    },
    {
      ts_bucket: 1697689960,
      severity_group: 'error',
      count: '10',
    },
    {
      ts_bucket: 1697689970,
      severity_group: 'info',
      count: '151',
    },
    {
      ts_bucket: 1697689970,
      severity_group: 'error',
      count: '10',
    },
    {
      ts_bucket: 1697689980,
      severity_group: 'error',
      count: '10',
    },
    {
      ts_bucket: 1697689980,
      severity_group: 'info',
      count: '208',
    },
    {
      ts_bucket: 1697689990,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697689990,
      severity_group: 'info',
      count: '199',
    },
    {
      ts_bucket: 1697690000,
      severity_group: 'info',
      count: '246',
    },
    {
      ts_bucket: 1697690000,
      severity_group: 'error',
      count: '10',
    },
    {
      ts_bucket: 1697690010,
      severity_group: 'info',
      count: '230',
    },
    {
      ts_bucket: 1697690010,
      severity_group: 'error',
      count: '10',
    },
    {
      ts_bucket: 1697690020,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697690020,
      severity_group: 'info',
      count: '200',
    },
    {
      ts_bucket: 1697690030,
      severity_group: 'info',
      count: '222',
    },
    {
      ts_bucket: 1697690030,
      severity_group: 'error',
      count: '15',
    },
    {
      ts_bucket: 1697690040,
      severity_group: 'info',
      count: '245',
    },
    {
      ts_bucket: 1697690040,
      severity_group: 'error',
      count: '15',
    },
    {
      ts_bucket: 1697690050,
      severity_group: 'info',
      count: '157',
    },
    {
      ts_bucket: 1697690060,
      severity_group: 'info',
      count: '145',
    },
    {
      ts_bucket: 1697690060,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697690070,
      severity_group: 'info',
      count: '133',
    },
    {
      ts_bucket: 1697690080,
      severity_group: 'info',
      count: '176',
    },
    {
      ts_bucket: 1697690090,
      severity_group: 'info',
      count: '203',
    },
    {
      ts_bucket: 1697690090,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697690100,
      severity_group: 'info',
      count: '152',
    },
    {
      ts_bucket: 1697690100,
      severity_group: 'error',
      count: '10',
    },
    {
      ts_bucket: 1697690110,
      severity_group: 'info',
      count: '178',
    },
    {
      ts_bucket: 1697690110,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697690120,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697690120,
      severity_group: 'info',
      count: '184',
    },
    {
      ts_bucket: 1697690130,
      severity_group: 'info',
      count: '126',
    },
    {
      ts_bucket: 1697690140,
      severity_group: 'info',
      count: '197',
    },
    {
      ts_bucket: 1697690140,
      severity_group: 'error',
      count: '10',
    },
    {
      ts_bucket: 1697690150,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697690150,
      severity_group: 'info',
      count: '190',
    },
    {
      ts_bucket: 1697690160,
      severity_group: 'info',
      count: '171',
    },
    {
      ts_bucket: 1697690160,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697690170,
      severity_group: 'info',
      count: '161',
    },
    {
      ts_bucket: 1697690170,
      severity_group: 'error',
      count: '5',
    },
    {
      ts_bucket: 1697690180,
      severity_group: 'error',
      count: '15',
    },
    {
      ts_bucket: 1697690180,
      severity_group: 'info',
      count: '385',
    },
    {
      ts_bucket: 1697690190,
      severity_group: 'error',
      count: '10',
    },
    {
      ts_bucket: 1697690190,
      severity_group: 'info',
      count: '254',
    },
    {
      ts_bucket: 1697690200,
      severity_group: 'error',
      count: '10',
    },
    {
      ts_bucket: 1697690200,
      severity_group: 'info',
      count: '167',
    },
    {
      ts_bucket: 1697690210,
      severity_group: 'info',
      count: '8',
    },
  ],
  rows: 163,
  rows_before_limit_at_least: 163,
  statistics: {
    elapsed: 0.054853842,
    rows_read: 77565,
    bytes_read: 1970319,
  },
}
