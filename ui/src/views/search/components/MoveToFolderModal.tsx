import React, { FC, useState } from 'react';
import { css } from 'emotion';
import { Button, HorizontalGroup, Modal, stylesFactory, useTheme } from 'src/packages/datav-core/src/ui';
import {  GrafanaTheme } from 'src/packages/datav-core/src';
import { FolderInfo } from 'src/types';
import { FolderPicker } from 'src/views/components/Pickers/FolderPicker';

import { backendSrv } from 'src/core/services/backend/backend';
import { DashboardSection, OnMoveItems } from '../types';
import { getCheckedDashboards } from '../utils';
import { notification } from 'antd';
import { useIntl,FormattedMessage } from 'react-intl';
import localeData from 'src/core/library/locale'
import { getState } from 'src/store/store';

interface Props {
  onMoveItems: OnMoveItems;
  results: DashboardSection[];
  isOpen: boolean;
  onDismiss: () => void;
}

export const MoveToFolderModal: FC<Props> = ({ results, onMoveItems, isOpen, onDismiss }) => {
  const intl = useIntl()
  const [folder, setFolder] = useState<FolderInfo | null>(null);
  const theme = useTheme();
  const styles = getStyles(theme);
  const selectedDashboards = getCheckedDashboards(results);

  const moveTo = () => {
    if (folder && selectedDashboards.length) {
      const folderTitle = folder.title ?? 'General';
      backendSrv.moveDashboards(selectedDashboards.map(d => d.uid) as string[], folder).then((result: any) => {
        if (result.successCount > 0) {
          const ending = result.successCount === 1 ? '' : 's';
          const header = `Dashboard${ending} Moved`;
          const msg = `${result.successCount} dashboard${ending} moved to ${folderTitle}`;
          notification['success']({
            message: header,
            description: msg,
            duration: 5
          });
        }

        if (result.totalCount === result.alreadyInFolderCount) {
          notification['error']({
            message: 'Error',
            description:intl.formatMessage({id: "info.targetUpdated"},{title: folderTitle}),
            duration: 5
          });

        } else {
          onMoveItems(selectedDashboards, folder);
        }

        onDismiss();
      });
    }
  };

  return isOpen ? (
    <Modal
      className={styles.modal}
      title={localeData[getState().application.locale]["folder.moveDashboardTitle"]}
      icon="folder-plus"
      isOpen={isOpen}
      onDismiss={onDismiss}
    >
      <>
        <div className={styles.content}>
          <p>
            <FormattedMessage id="folder.moveDashboardTips" values={{count: selectedDashboards.length}}/>
          </p>
          <FolderPicker onChange={f => setFolder(f as FolderInfo)} useNewForms />
        </div>

        <HorizontalGroup justify="center">
          <Button variant="primary" onClick={moveTo}>
             <FormattedMessage id="common.move"/>
          </Button>
          <Button variant="secondary" onClick={onDismiss}>
            <FormattedMessage id="common.cancel"/>
          </Button>
        </HorizontalGroup>
      </>
    </Modal>
  ) : null;
};

const getStyles = stylesFactory((theme: GrafanaTheme) => {
  return {
    modal: css`
      width: 500px;
    `,
    content: css`
      margin-bottom: ${theme.spacing.lg};
    `,
  };
});
