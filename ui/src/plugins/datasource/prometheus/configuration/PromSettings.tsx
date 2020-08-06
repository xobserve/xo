import React, { SyntheticEvent } from 'react';
import { EventsWithValidation, InlineFormLabel, regexValidation, LegacyForms } from 'src/packages/datav-core';
import {
  SelectableValue,
  onUpdateDatasourceJsonDataOptionChecked,
  DataSourcePluginOptionsEditorProps,
} from 'src/packages/datav-core';
import { PromOptions } from '../types';
import { FormattedMessage } from 'react-intl';

const { LegacySelect : Select, LegacyInput: Input, LegacyFormField: FormField, LegacySwitch: Switch } = LegacyForms;

const httpOptions = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
];

type Props = Pick<DataSourcePluginOptionsEditorProps<PromOptions>, 'options' | 'onOptionsChange'>;

export const PromSettings = (props: Props) => {
  const { options, onOptionsChange } = props;

  return (
    <>
      <div className="gf-form-group">
        <div className="gf-form-inline">
          <div className="gf-form">
            <FormField
              label={<FormattedMessage id="datasource.scrapeInterval"/>}
              labelWidth={13}
              inputEl={
                <Input
                  className="width-6"
                  value={options.jsonData.timeInterval}
                  spellCheck={false}
                  placeholder="15s"
                  onChange={onChangeHandler('timeInterval', options, onOptionsChange)}
                  validationEvents={promSettingsValidationEvents}
                />
              }
              tooltip={<FormattedMessage id="datasource.scrapeIntervalTooltip"/>}
            />
          </div>
        </div>
        <div className="gf-form-inline">
          <div className="gf-form">
            <FormField
              label={<FormattedMessage id="datasource.queryTimeout"/>}
              labelWidth={13}
              inputEl={
                <Input
                  className="width-6"
                  value={options.jsonData.queryTimeout}
                  onChange={onChangeHandler('queryTimeout', options, onOptionsChange)}
                  spellCheck={false}
                  placeholder="60s"
                  validationEvents={promSettingsValidationEvents}
                />
              }
              tooltip={<FormattedMessage id="datasource.queryTimeoutTooltip"/>}
            />
          </div>
        </div>
        <div className="gf-form">
          <InlineFormLabel
            width={13}
            tooltip={<FormattedMessage id="datasource.httpMethodTooltip"/>}
          >
            <FormattedMessage id="datasource.httpMethod"/>
          </InlineFormLabel>
          <Select
            options={httpOptions}
            value={httpOptions.find(o => o.value === options.jsonData.httpMethod)}
            onChange={onChangeHandler('httpMethod', options, onOptionsChange)}
            width={7}
          />
        </div>
      </div>
      {/* <h3 className="page-heading">Misc</h3>
      <div className="gf-form-group">
        <div className="gf-form">
          <Switch
            checked={options.jsonData.disableMetricsLookup}
            label="Disable metrics lookup"
            labelClass="width-14"
            onChange={onUpdateDatasourceJsonDataOptionChecked(props, 'disableMetricsLookup')}
            tooltip="Checking this option will disable the metrics chooser and metric/label support in the query field's autocomplete. This helps if you have performance issues with bigger Prometheus instances."
          />
        </div>
        <div className="gf-form max-width-30">
          <div className="gf-form-inline">
            <FormField
              label="Custom query parameters"
              labelWidth={14}
              tooltip="Add Custom parameters to Prometheus or Thanos queries."
              inputEl={
                <Input
                  className="width-25"
                  value={options.jsonData.customQueryParameters}
                  onChange={onChangeHandler('customQueryParameters', options, onOptionsChange)}
                  spellCheck={false}
                  placeholder="Example: max_source_resolution=5m&timeout=10"
                />
              }
            />
          </div>
        </div>
      </div> */}
    </>
  );
};

export const promSettingsValidationEvents = {
  [EventsWithValidation.onBlur]: [
    regexValidation(
      /^$|^\d+(ms|[Mwdhmsy])$/,
      'Value is not valid, you can use number with time unit specifier: y, M, w, d, h, m, s'
    ),
  ],
};

export const getValueFromEventItem = (eventItem: SyntheticEvent<HTMLInputElement> | SelectableValue<string>) => {
  if (!eventItem) {
    return '';
  }

  if (eventItem.hasOwnProperty('currentTarget')) {
    return eventItem.currentTarget.value;
  }

  return (eventItem as SelectableValue<string>).value;
};

const onChangeHandler = (
  key: keyof PromOptions,
  options: Props['options'],
  onOptionsChange: Props['onOptionsChange']
) => (eventItem: SyntheticEvent<HTMLInputElement> | SelectableValue<string>) => {
  onOptionsChange({
    ...options,
    jsonData: {
      ...options.jsonData,
      [key]: getValueFromEventItem(eventItem),
    },
  });
};
