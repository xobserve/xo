import { DataQueryError, LoadingState, PanelData } from 'src/packages/datav-core/src';
import { useEffect, useRef, useState } from 'react';
import { PanelModel } from 'src/views/dashboard/model';
import { Unsubscribable } from 'rxjs';
import { GetDataOptions } from 'src/views/dashboard/model/PanelQueryRunner';

interface UsePanelLatestData {
  data?: PanelData;
  error?: DataQueryError;
  isLoading: boolean;
  hasSeries: boolean;
}

/**
 * Subscribes and returns latest panel data from PanelQueryRunner
 */
export const usePanelLatestData = (panel: PanelModel, options: GetDataOptions): UsePanelLatestData => {
  const querySubscription = useRef<Unsubscribable>();
  const [latestData, setLatestData] = useState<PanelData>();

  useEffect(() => {
    querySubscription.current = panel
      .getQueryRunner()
      .getData(options)
      .subscribe({
        next: data => setLatestData(data),
      });

    return () => {
      if (querySubscription.current) {
        querySubscription.current.unsubscribe();
      }
    };
    /**
     * Adding separate options to dependencies array to avoid additional hook for comparing previous options with current.
     * Otherwise, passing different references to the same object may cause troubles.
     */
  }, [panel, options.withFieldConfig, options.withTransforms]);

  return {
    data: latestData,
    error: latestData && latestData.error,
    isLoading: latestData ? latestData.state === LoadingState.Loading : true,
    hasSeries: latestData ? !!latestData.series : false,
  };
};
