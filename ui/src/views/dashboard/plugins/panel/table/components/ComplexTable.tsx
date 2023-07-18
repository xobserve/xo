import React from 'react';
import { Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Button } from '@chakra-ui/react';
import { TableRow } from 'types/plugins/table';
import { TableSettings } from 'types/panel/plugins';
import storage from 'utils/localStorage';

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}


interface Props {
  panelId: number
  dashboardId: string
  columns:  ColumnsType<TableRow>
  data: TableRow[]
  options: TableSettings
}

const storagePageKey = "tablePage"
const ComplexTable = (props: Props) => {
  const {columns, data,dashboardId,panelId} = props

  const pageKey = storagePageKey+dashboardId+panelId
  const onShowSizeChange = (current, pageSize) => {
    storage.set(pageKey, pageSize)
  };

  return (<>
    <Table 
      columns={columns} 
      dataSource={data} 
      size="small" 
      pagination={{total: props.data.length, showSizeChanger: true,defaultPageSize:storage.get(pageKey)??10, pageSizeOptions: [5,10,20,50,100],onShowSizeChange:onShowSizeChange }} />
  </>)
}

export default ComplexTable