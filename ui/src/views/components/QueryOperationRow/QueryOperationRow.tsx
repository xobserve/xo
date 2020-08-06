import React, { useState } from 'react';
import { Icon} from 'src/packages/datav-core';
import {Row} from 'antd'
import { useUpdateEffect } from 'react-use';
import {renderOrCallToRender} from 'src/core/library/utils/renderOrCallToRender'
import './QueryOperationRow.less'

interface QueryOperationRowProps {
  title?: ((props: { isOpen: boolean }) => React.ReactNode) | React.ReactNode;
  headerElement?: React.ReactNode;
  actions?:
    | ((props: { isOpen: boolean; openRow: () => void; closeRow: () => void }) => React.ReactNode)
    | React.ReactNode;
  onOpen?: () => void;
  onClose?: () => void;
  children: React.ReactNode;
  isOpen?: boolean;
}

export const QueryOperationRow: React.FC<QueryOperationRowProps> = ({
  children,
  actions,
  title,
  headerElement,
  onClose,
  onOpen,
  isOpen,
}: QueryOperationRowProps) => {
  const [isContentVisible, setIsContentVisible] = useState(isOpen !== undefined ? isOpen : true);
  useUpdateEffect(() => {
    if (isContentVisible) {
      if (onOpen) {
        onOpen();
      }
    } else {
      if (onClose) {
        onClose();
      }
    }
  }, [isContentVisible]);

  const titleElement = title && renderOrCallToRender(title, { isOpen: isContentVisible });
  const actionsElement =
    actions &&
    renderOrCallToRender(actions, {
      isOpen: isContentVisible,
      openRow: () => {
        setIsContentVisible(true);
      },
      closeRow: () => {
        setIsContentVisible(false);
      },
    });

  return (
    <div className={'query-operation-row-wrapper'}>
      <div className={'header'}>
        <Row justify="space-between" style={{width: '100%'}}>
          <div
            className={'titleWrapper'}
            onClick={() => {
              setIsContentVisible(!isContentVisible);
            }}
            aria-label="Query operation row title"
          >
            <Icon name={isContentVisible ? 'angle-down' : 'angle-right'} className={'collapseIcon'} />
            {title && <span className={'title'}>{titleElement}</span>}
            {headerElement}
          </div>
          {actions && actionsElement}
        </Row>
      </div>
      {isContentVisible && <div className={'content'}>{children}</div>}
    </div>
  );
};


QueryOperationRow.displayName = 'QueryOperationRow';
