import React from 'react';
import { DataQuery, DataSourceApi } from 'src/packages/datav-core';
import {Row} from 'antd'
import './QueryEditorRowTitle.less'

interface QueryEditorRowTitleProps {
  query: DataQuery;
  datasource: DataSourceApi;
  inMixedMode: boolean;
  disabled: boolean;
  onClick: (e: React.MouseEvent) => void;
  collapsedText: string;
}

export const QueryEditorRowTitle: React.FC<QueryEditorRowTitleProps> = ({
  datasource,
  inMixedMode,
  disabled,
  query,
  onClick,
  collapsedText,
}) => {
  return (
    <Row align="middle" className="query-editor-row-title">
      <div className={'refId'}>
        <span>{query.refId}</span>
        {inMixedMode && <em className={'contextInfo'}> ({datasource.name})</em>}
        {disabled && <em className={'contextInfo'}> Disabled</em>}
      </div>
      {collapsedText && (
        <div className={'collapsedText'} onClick={onClick}>
          {collapsedText}
        </div>
      )}
    </Row>
  );
};

