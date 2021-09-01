import React, { useState } from 'react';
import { DataFrame, DataTransformerConfig, TransformerRegistryItem } from 'src/packages/datav-core/src';
import { HorizontalGroup } from 'src/packages/datav-core/src/ui';

import { TransformationEditor } from './TransformationEditor';

import { TransformationsEditorTransformation } from './types';
import { QueryOperationRow } from 'src/views/components/QueryOperationRow/QueryOperationRow';
import { QueryOperationAction } from 'src/views/components/QueryOperationRow/QueryOperationAction';

interface TransformationOperationRowProps {
  id: string;
  index: number;
  data: DataFrame[];
  uiConfig: TransformerRegistryItem<any>;
  configs: TransformationsEditorTransformation[];
  onRemove: (index: number) => void;
  onChange: (index: number, config: DataTransformerConfig) => void;
}

export const TransformationOperationRow: React.FC<TransformationOperationRowProps> = ({
  onRemove,
  index,
  id,
  data,
  configs,
  uiConfig,
  onChange,
}) => {
  const [showDebug, setShowDebug] = useState(false);

  const renderActions = ({ isOpen }: { isOpen: boolean }) => {
    return (
      <HorizontalGroup align="center" width="auto">
        <QueryOperationAction
          title="Debug"
          disabled={!isOpen}
          icon="bug"
          onClick={() => {
            setShowDebug(!showDebug);
          }}
        />

        <QueryOperationAction title="Remove" icon="trash-alt" onClick={() => onRemove(index)} />
      </HorizontalGroup>
    );
  };

  return (
    <QueryOperationRow id={id} index={index} title={uiConfig.name} draggable actions={renderActions}>
      <TransformationEditor
        debugMode={showDebug}
        index={index}
        data={data}
        configs={configs}
        uiConfig={uiConfig}
        onChange={onChange}
      />
    </QueryOperationRow>
  );
};
