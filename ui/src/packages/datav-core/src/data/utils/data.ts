import {DataFrame,TableData,Column} from '../types'
 
export const toLegacyTableData = (frame: DataFrame):  TableData => {
    const { fields } = frame;
  
    const rowCount = frame.length;
    const rows: any[][] = [];
  
    for (let i = 0; i < rowCount; i++) {
      const row: any[] = [];
      for (let j = 0; j < fields.length; j++) {
        row.push(fields[j].values.get(i));
      }
      rows.push(row);
    }
  
    return {
      columns: fields.map(f => {
        const { name, config } = f;
        if (config) {
          // keep unit etc
          const { ...column } = config;
          (column as Column).text = name;
          return column as Column;
        }
        return { text: name };
      }),
      type: 'table',
      refId: frame.refId,
      meta: frame.meta,
      rows,
    };
  };
  