import React from 'react'; 
import { IconButton, IconName} from 'src/packages/datav-core';


interface QueryOperationActionProps {
  icon: IconName;
  title?: string;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

export const QueryOperationAction: React.FC<QueryOperationActionProps> = ({ icon, disabled, title, ...otherProps }) => {
  const onClick = (e: React.MouseEvent) => {
    if (!disabled) {
      otherProps.onClick(e);
    }
  };
  return (
    <IconButton
      name={icon}
      title={title}
      className={'query-operation-action-icon'}
      disabled={!!disabled}
      onClick={onClick}
      surface="header"
    />
  );
};

QueryOperationAction.displayName = 'QueryOperationAction';

