import React from 'react';

import { CompletionItem } from '../..';


interface Props {
  item: CompletionItem;
  height: number;
}

export const TypeaheadInfo: React.FC<Props> = ({ item, height }) => {
  const visible = item && !!item.documentation;
  const label = item ? item.label : '';
  const documentation = item && item.documentation ? item.documentation : '';

  return (
    <div className={'type-ahead-info-item'} style={{visibility: visible === true ? 'visible' : 'hidden',height:`${height +4}px`}}>
      <b>{label}</b>
      <hr />
      <span>{documentation}</span>
    </div>
  );
};
