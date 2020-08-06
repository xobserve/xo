import React, { memo } from 'react';

// Types
import { ExploreQueryFieldProps } from 'src/packages/datav-core';

import { PrometheusDatasource } from '../datasource';
import { PromQuery, PromOptions } from '../types';



export type Props = ExploreQueryFieldProps<PrometheusDatasource, PromQuery, PromOptions>;

export const PromExploreQueryEditor = (props:Props) => {
  return (
    <div>PromExploreQueryEditor</div>
  );
}

export default memo(PromExploreQueryEditor);
