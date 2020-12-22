import React, { FC } from 'react';
import { css } from 'emotion';
import { Modal } from '../Modal/Modal';
import { IconName } from '../../types/icon';
import { Button } from '../Button';
import { stylesFactory, useTheme } from '../../themes';
import { DatavTheme } from '../../../data';
import { HorizontalGroup } from '..';
import { FormattedMessage } from 'react-intl';

export interface Props {
  isOpen: boolean;
  title: any;
  body: React.ReactNode;
  confirmText: any;
  dismissText?: any;
  icon?: IconName;
  onConfirm(): void;
  onDismiss(): void;
}

export const ConfirmModal: FC<Props> = ({
  isOpen,
  title,
  body,
  confirmText,
  dismissText = <FormattedMessage id="common.cancel"/>,
  icon = 'exclamation-triangle',
  onConfirm,
  onDismiss,
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <Modal className={styles.modal} title={title} icon={icon} isOpen={isOpen} onDismiss={onDismiss}>
      <div className={styles.modalContent}>
        <div className={styles.modalText}>{body}</div>
        <HorizontalGroup justify="center">
          <Button variant="destructive" onClick={onConfirm}>
            {confirmText}
          </Button>
          <Button variant="secondary" onClick={onDismiss}>
            {dismissText}
          </Button>
        </HorizontalGroup>
      </div>
    </Modal>
  );
};

const getStyles = stylesFactory((theme: DatavTheme) => ({
  modal: css`
    width: 500px;
  `,
  modalContent: css`
    text-align: center;
  `,
  modalText: css`
    font-size: ${theme.typography.heading.h4};
    color: ${theme.colors.link};
    margin-bottom: calc(${theme.spacing.d} * 2);
    padding-top: ${theme.spacing.d};
  `,
}));
