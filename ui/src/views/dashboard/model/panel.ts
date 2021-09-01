import { message } from 'antd';

// Store
import localStore from 'src/core/library/utils/localStore';

// Models
import { DashboardModel } from './DashboardModel';
import { PanelModel } from './PanelModel';
import { TimeRange,rangeUtil,dateMath, localeData, currentLang, getBootConfig} from 'src/packages/datav-core/src';
import {appEvents} from 'src/core/library/utils/app_events'
// Utils
import { isString as _isString } from 'lodash';

// Services
import templateSrv from 'src/core/services/templating';

// Constants
import { LS_PANEL_COPY_KEY, PANEL_BORDER } from 'src/core/constants';
import {CoreEvents} from 'src/types'

const theme = getBootConfig().theme
export const removePanel = (dashboard: DashboardModel, panel: PanelModel, ask: boolean) => {
  // confirm deletion
  if (ask !== false) {
    appEvents.emit(CoreEvents.showConfirmModal, {
      title: localeData[currentLang]['dashboard.removePanel'],
      text: localeData[currentLang]['dashboard.removePanelConfirm'],
      yesText: localeData[currentLang]['common.remove'],
      onConfirm: () => removePanel(dashboard, panel, false),
    });
    return;
  }
  dashboard.removePanel(panel);
};

export const duplicatePanel = (dashboard: DashboardModel, panel: PanelModel) => {
  dashboard.duplicatePanel(panel);
};

export const copyPanel = (panel: PanelModel) => {
  localStore.set(LS_PANEL_COPY_KEY, JSON.stringify(panel.getSaveModel()));
  message.success(localeData[currentLang]['dashboard.panelCopyTips'])
};


export const refreshPanel = (panel: PanelModel) => {
  panel.refresh();
};

export const toggleLegend = (panel: PanelModel) => {
  console.log('Toggle legend is not implemented yet');
  // We need to set panel.legend defaults first
  // panel.legend.show = !panel.legend.show;
  refreshPanel(panel);
};

export interface TimeOverrideResult {
  timeRange: TimeRange;
  timeInfo: string;
}

export function applyPanelTimeOverrides(panel: PanelModel, timeRange: TimeRange): TimeOverrideResult {
  const newTimeData = {
    timeInfo: '',
    timeRange: timeRange,
  };

  if (panel.timeFrom) {
    const timeFromInterpolated = templateSrv.replace(panel.timeFrom, panel.scopedVars);
    const timeFromInfo = rangeUtil.describeTextRange(timeFromInterpolated);
    if (timeFromInfo.invalid) {
      newTimeData.timeInfo = 'invalid time override';
      return newTimeData;
    }

    if (_isString(timeRange.raw.from)) {
      const timeFromDate = dateMath.parse(timeFromInfo.from);
      newTimeData.timeInfo = timeFromInfo.display;
      newTimeData.timeRange = {
        from: timeFromDate,
        to: dateMath.parse(timeFromInfo.to),
        raw: {
          from: timeFromInfo.from,
          to: timeFromInfo.to,
        },
      };
    }
  }

  if (panel.timeShift) {
    const timeShiftInterpolated = templateSrv.replace(panel.timeShift, panel.scopedVars);
    const timeShiftInfo = rangeUtil.describeTextRange(timeShiftInterpolated);
    if (timeShiftInfo.invalid) {
      newTimeData.timeInfo = 'invalid timeshift';
      return newTimeData;
    }

    const timeShift = '-' + timeShiftInterpolated;
    newTimeData.timeInfo += ' timeshift ' + timeShift;
    const from = dateMath.parseDateMath(timeShift, newTimeData.timeRange.from, false);
    const to = dateMath.parseDateMath(timeShift, newTimeData.timeRange.to, true);

    newTimeData.timeRange = {
      from,
      to,
      raw: {
        from,
        to,
      },
    };
  }

  if (panel.hideTimeOverride) {
    newTimeData.timeInfo = '';
  }

  return newTimeData;
}

export function getResolution(panel: PanelModel): number {
  const htmlEl = document.getElementsByTagName('html')[0];
  const width = htmlEl.getBoundingClientRect().width; // https://stackoverflow.com/a/21454625

  return panel.maxDataPoints ? panel.maxDataPoints : Math.ceil(width * (panel.gridPos.w / 24));
}

export function calculateInnerPanelHeight(panel: PanelModel, containerHeight: number): number {
  const chromePadding = panel.plugin && panel.plugin.noPadding ? 0 : theme.panelPadding * 2;
  const headerHeight = panel.hasTitle() ? theme.panelHeaderHeight : 0;
  return containerHeight - headerHeight - chromePadding - PANEL_BORDER;
}
