import React, { useState, useCallback } from 'react';
import { SelectableValue,DataSourceSettings } from '../../../data';
import { css, cx } from 'emotion';
import { useTheme } from '../../themes';
import { BasicAuthSettings } from './BasicAuthSettings';
import { HttpProxySettings } from './HttpProxySettings';
import { TLSAuthSettings } from './TLSAuthSettings';
import { HttpSettingsProps } from './types';
import { CustomHeadersSettings } from './CustomHeadersSettings';
import { Select } from '../Form/Legacy/Select/Select';
import { Input } from '../Form/Legacy/Input/Input';
import { Icon } from '../Icon/Icon';
import { FormField } from '../Form/Legacy/Field/FormField';
import { FormLabel } from '../Form/Legacy/Field/FormLabel';
import { Switch } from '../Form/Legacy/Switch/Switch';
import { TagsInput } from '../TagsInput/TagsInput';
import { FormattedMessage } from 'react-intl';



export const DataSourceHttpSettings: React.FC<HttpSettingsProps> = props => {
  const { defaultUrl, dataSourceConfig, onChange, showAccessOptions } = props;
  let urlTooltip;
  const [isAccessHelpVisible, setIsAccessHelpVisible] = useState(false);
  const theme = useTheme();

  const onSettingsChange = useCallback(
    (change: Partial<DataSourceSettings<any, any>>) => {
      onChange({
        ...dataSourceConfig,
        ...change,
      });
    },
    [dataSourceConfig]
  );


  const isValidUrl = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/.test(
    dataSourceConfig.url
  );

  const notValidStyle = css`
    box-shadow: inset 0 0px 5px ${theme.palette.red};
  `;

  const inputStyle = cx({ [`width-20`]: true, [notValidStyle]: !isValidUrl });

  const urlInput = (
    <Input
      className={inputStyle}
      placeholder={defaultUrl}
      value={dataSourceConfig.url}
      onChange={event => onSettingsChange({ url: event.currentTarget.value })}
    />
  );

  return (
    <div className="gf-form-group">
      <>
        <h3 className="page-heading">HTTP</h3>
        <div className="gf-form-group">
          <div className="gf-form">
            <FormField label="URL" labelWidth={11} tooltip={urlTooltip} inputEl={urlInput} />
          </div>
          {(
            <div className="gf-form">
              <FormLabel
                width={11}
                tooltip={<FormattedMessage id="datasource.whitelistCookiesTooltip"/>}
              >
                 <FormattedMessage id="datasource.whitelistCookies"/>
              </FormLabel>
              <TagsInput
                tags={dataSourceConfig.jsonData.keepCookies}
                onChange={cookies =>
                  onSettingsChange({ jsonData: { ...dataSourceConfig.jsonData, keepCookies: cookies } })
                }
                width={20}
              />
            </div>
          )}
        </div>
      </>

      <>
        {/* <h3 className="page-heading">Auth</h3>
        <div className="gf-form-group">
          <div className="gf-form-inline">
            <Switch
              label="Basic auth"
              labelClass="width-13"
              checked={dataSourceConfig.basicAuth}
              onChange={event => {
                onSettingsChange({ basicAuth: event!.currentTarget.checked });
              }}
            />
            <Switch
              label="With Credentials"
              labelClass="width-13"
              checked={dataSourceConfig.withCredentials}
              onChange={event => {
                onSettingsChange({ withCredentials: event!.currentTarget.checked });
              }}
              tooltip="Whether credentials such as cookies or auth headers should be sent with cross-site requests."
            />
          </div>

          {(
            <HttpProxySettings
              dataSourceConfig={dataSourceConfig}
              onChange={jsonData => onSettingsChange({ jsonData })}
            />
          )}
        </div> */}
        {dataSourceConfig.basicAuth && (
          <>
            <h6>Basic Auth Details</h6>
            <div className="gf-form-group">
              <BasicAuthSettings {...props} />
            </div>
          </>
        )}

        {(dataSourceConfig.jsonData.tlsAuth || dataSourceConfig.jsonData.tlsAuthWithCACert) && (
          <TLSAuthSettings dataSourceConfig={dataSourceConfig} onChange={onChange} />
        )}

        <CustomHeadersSettings dataSourceConfig={dataSourceConfig} onChange={onChange} />
      </>
    </div>
  );
};
