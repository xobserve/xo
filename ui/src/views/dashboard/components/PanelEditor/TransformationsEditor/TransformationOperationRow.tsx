import { DataFrame } from 'src/packages/datav-core/src';
import React, { useState } from 'react';
import { HorizontalGroup } from 'src/packages/datav-core/src';
import { TransformationEditor } from './TransformationEditor';
import { QueryOperationRow } from 'src/views/components/QueryOperationRow/QueryOperationRow';
import { QueryOperationAction } from 'src/views/components/QueryOperationRow/QueryOperationAction';

interface TransformationOperationRowProps {
  name: string;
  description: string;
  editor?: JSX.Element;
  onRemove: () => void;
  input: DataFrame[];
  output: DataFrame[];
}

export const TransformationOperationRow: React.FC<TransformationOperationRowProps> = ({
  children,
  onRemove,
  ...props
}) => {
  const [showDebug, setShowDebug] = useState(false);

  const renderActions = ({ isOpen }: { isOpen: boolean }) => {
    return (
      <HorizontalGroup align="center" width="auto">
        <QueryOperationAction
          disabled={!isOpen}
          icon="bug"
          onClick={() => {
            setShowDebug(!showDebug);
          }}
        />

        <QueryOperationAction icon="trash-alt" onClick={onRemove} />
      </HorizontalGroup>
    );
  };

  return (
    <QueryOperationRow title={props.name} actions={renderActions}>
      <TransformationEditor {...props} debugMode={showDebug} />
    </QueryOperationRow>
  );
};
