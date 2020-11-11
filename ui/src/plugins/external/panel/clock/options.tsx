import React from 'react';
import { PanelOptionsEditorBuilder, DatavTheme, dateTime, getTheme } from 'src/packages/datav-core/src';
import { ColorPicker, Input, Icon, stylesFactory } from 'src/packages/datav-core/src';
import { css } from 'emotion';
import { config } from 'src/packages/datav-core/src';

import { ClockOptions, ClockMode, ClockType, FontWeight, ZoneFormat } from './types';
import { getTimeZoneNames } from './ClockPanel';

export const optionsBuilder = (builder: PanelOptionsEditorBuilder<ClockOptions>) => {
  const theme = getTheme()
  // Global options
  builder
    .addRadio({
      path: 'mode',
      name: 'Mode',
      settings: {
        options: [
          { value: ClockMode.time, label: 'Time' },
          { value: ClockMode.countdown, label: 'Countdown' },
        ],
      },
      defaultValue: ClockMode.time,
    })
    .addCustomEditor({
      id: 'bgColor',
      path: 'bgColor',
      name: 'Background Color',
      editor: props => {
        const styles = getStyles(theme);
        let prefix: React.ReactNode = null;
        let suffix: React.ReactNode = null;
        if (props.value) {
          suffix = <Icon className={styles.trashIcon} name="trash-alt" onClick={() => props.onChange(undefined)} />;
        }

        prefix = (
          <div className={styles.inputPrefix}>
            <div className={styles.colorPicker}>
              <ColorPicker
                color={props.value || theme.colors.panelBg}
                onChange={props.onChange}
                enableNamedColors={true}
              />
            </div>
          </div>
        );

        return (
          <div>
            <Input
              type="text"
              value={props.value || 'Pick Color'}
              onBlur={(v: any) => {
                console.log('CLICK');
              }}
              prefix={prefix}
              suffix={suffix}
            />
          </div>
        );
      },
      defaultValue: '',
    });
  // TODO: refreshSettings.syncWithDashboard

  addCountdown(builder);
  addTimeFormat(builder);
  addTimeZone(builder);
  addDateFormat(builder);
};

//---------------------------------------------------------------------
// COUNTDOWN
//---------------------------------------------------------------------
function addCountdown(builder: PanelOptionsEditorBuilder<ClockOptions>) {
  const category = ['Countdown'];

  builder
    .addTextInput({
      category,
      path: 'countdownSettings.endCountdownTime',
      name: 'End Time',
      settings: {
        placeholder: 'ISO 8601 or RFC 2822 Date time',
      },
      defaultValue: dateTime(Date.now())
        .add(6, 'h')
        .format(),
      showIf: o => o.mode === ClockMode.countdown,
    })
    .addTextInput({
      category,
      path: 'countdownSettings.endText',
      name: 'End Text',
      defaultValue: '00:00:00',
      showIf: o => o.mode === ClockMode.countdown,
    })

    .addTextInput({
      category,
      path: 'countdownSettings.customFormat',
      name: 'Custom format',
      settings: {
        placeholder: 'optional',
      },
      defaultValue: undefined,
      showIf: o => o.mode === ClockMode.countdown,
    });
}

//---------------------------------------------------------------------
// TIME FORMAT
//---------------------------------------------------------------------
function addTimeFormat(builder: PanelOptionsEditorBuilder<ClockOptions>) {
  const category = ['Time Format'];

  builder
    .addRadio({
      category,
      path: 'clockType',
      name: 'Clock Type',
      settings: {
        options: [
          { value: ClockType.H24, label: '24 Hour' },
          { value: ClockType.H12, label: '12 Hour' },
          { value: ClockType.Custom, label: 'Custom' },
        ],
      },
      defaultValue: ClockType.H24,
    })
    .addTextInput({
      category,
      path: 'timeSettings.customFormat',
      name: 'Time Format',
      description: 'the date formatting pattern',
      settings: {
        placeholder: 'date format',
      },
      defaultValue: undefined,
      showIf: opts => opts.clockType === ClockType.Custom,
    })
    .addTextInput({
      category,
      path: 'timeSettings.fontSize',
      name: 'Font size',
      settings: {
        placeholder: 'date format',
      },
      defaultValue: '12px',
    })
    .addRadio({
      category,
      path: 'timeSettings.fontWeight',
      name: 'Font weight',
      settings: {
        options: [
          { value: FontWeight.normal, label: 'Normal' },
          { value: FontWeight.bold, label: 'Bold' },
        ],
      },
      defaultValue: FontWeight.normal,
    });
}

//---------------------------------------------------------------------
// TIMEZONE
//---------------------------------------------------------------------
function addTimeZone(builder: PanelOptionsEditorBuilder<ClockOptions>) {
  const category = ['Timezone'];

  const timezones = getTimeZoneNames().map(n => {
    return { label: n, value: n };
  });
  timezones.unshift({ label: 'Default', value: '' });

  builder
    .addSelect({
      category,
      path: 'timezone',
      name: 'Timezone',
      settings: {
        options: timezones,
      },
      defaultValue: '',
    })
    .addBooleanSwitch({
      category,
      path: 'timezoneSettings.showTimezone',
      name: 'Show Timezone',
      defaultValue: false,
    })
    .addSelect({
      category,
      path: 'timezoneSettings.zoneFormat',
      name: 'Display Format',
      settings: {
        options: [
          { value: ZoneFormat.name, label: 'Normal' },
          { value: ZoneFormat.nameOffset, label: 'Name + Offset' },
          { value: ZoneFormat.offsetAbbv, label: 'Offset + Abbreviation' },
          { value: ZoneFormat.offset, label: 'Offset' },
          { value: ZoneFormat.abbv, label: 'Abbriviation' },
        ],
      },
      defaultValue: ZoneFormat.offsetAbbv,
      showIf: s => s.timezoneSettings?.showTimezone,
    })
    .addTextInput({
      category,
      path: 'timezoneSettings.fontSize',
      name: 'Font size',
      settings: {
        placeholder: 'font size',
      },
      defaultValue: '12px',
      showIf: s => s.timezoneSettings?.showTimezone,
    })
    .addRadio({
      category,
      path: 'timezoneSettings.fontWeight',
      name: 'Font weight',
      settings: {
        options: [
          { value: FontWeight.normal, label: 'Normal' },
          { value: FontWeight.bold, label: 'Bold' },
        ],
      },
      defaultValue: FontWeight.normal,
      showIf: s => s.timezoneSettings?.showTimezone,
    });
}

//---------------------------------------------------------------------
// DATE FORMAT
//---------------------------------------------------------------------
function addDateFormat(builder: PanelOptionsEditorBuilder<ClockOptions>) {
  const category = ['Date Options'];

  builder
    .addBooleanSwitch({
      category,
      path: 'dateSettings.showDate',
      name: 'Show Date',
      defaultValue: false,
    })
    .addTextInput({
      category,
      path: 'dateSettings.dateFormat',
      name: 'Date Format',
      settings: {
        placeholder: 'Enter date format',
      },
      defaultValue: 'YYYY-MM-DD',
      showIf: s => s.dateSettings?.showDate,
    })
    .addTextInput({
      category,
      path: 'dateSettings.locale',
      name: 'Locale',
      settings: {
        placeholder: 'Enter locale: de, fr, es, ... (default: en)',
      },
      defaultValue: '',
      showIf: s => s.dateSettings?.showDate,
    })
    .addTextInput({
      category,
      path: 'dateSettings.fontSize',
      name: 'Font size',
      settings: {
        placeholder: 'date format',
      },
      defaultValue: '20px',
      showIf: s => s.dateSettings?.showDate,
    })
    .addRadio({
      category,
      path: 'dateSettings.fontWeight',
      name: 'Font weight',
      settings: {
        options: [
          { value: FontWeight.normal, label: 'Normal' },
          { value: FontWeight.bold, label: 'Bold' },
        ],
      },
      defaultValue: FontWeight.normal,
      showIf: s => s.dateSettings?.showDate,
    });
}

const getStyles = stylesFactory((theme: DatavTheme) => {
  return {
    colorPicker: css`
      padding: 0 ${theme.spacing.sm};
    `,
    inputPrefix: css`
      display: flex;
      align-items: center;
    `,
    trashIcon: css`
      color: ${theme.colors.textWeak};
      cursor: pointer;

      &:hover {
        color: ${theme.colors.text};
      }
    `,
  };
});
