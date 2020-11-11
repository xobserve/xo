import { useEffect, useRef, useState } from 'react';
import { PanelData } from 'src/packages/datav-core/src';
import { PanelModel } from '../../../model';
import { Unsubscribable } from 'rxjs';
import { GetDataOptions } from '../../../model/PanelQueryRunner';

export const usePanelLatestData = (panel: PanelModel, options: GetDataOptions): [PanelData | null, boolean] => {
  const querySubscription = useRef<Unsubscribable>(null);
  const [latestData, setLatestData] = useState<PanelData>(null);

  useEffect(() => {
    querySubscription.current = panel
      .getQueryRunner()
      .getData(options)
      .subscribe({
        next: data => setLatestData(data),
      });

    return () => {
      if (querySubscription.current) {
        console.log('unsubscribing');
        querySubscription.current.unsubscribe();
      }
    };
  }, [panel]);

  return [
    latestData,
    // TODO: make this more clever, use PanelData.state
    !!(latestData && latestData.series),
  ];
};
