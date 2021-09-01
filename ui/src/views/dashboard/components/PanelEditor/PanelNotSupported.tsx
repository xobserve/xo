/*eslint-disable*/
import React, { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { Button, VerticalGroup } from 'src/packages/datav-core/src/ui';
import { Layout } from 'src/packages/datav-core/src/ui/components/Layout/Layout';

import { updateLocation } from 'src/store/reducers/location';
import { PanelEditorTabId } from './types';


export interface Props {
  message: string;
  dispatch?: Dispatch;
}

export const PanelNotSupported: FC<Props> = ({ message, dispatch: propsDispatch }) => {
  const dispatch = propsDispatch ? propsDispatch : useDispatch();
  const onBackToQueries = useCallback(() => {
    dispatch(updateLocation({ query: { tab: PanelEditorTabId.Query }, partial: true }));
  }, [dispatch]);

  return (
    <Layout justify="center" style={{ marginTop: '100px' }}>
      <VerticalGroup spacing="md">
        <h2>{message}</h2>
        <div>
          <Button size="md" variant="secondary" icon="arrow-left" onClick={onBackToQueries}>
            Go back to Queries
          </Button>
        </div>
      </VerticalGroup>
    </Layout>
  );
};
