// Libraries
import React, { PureComponent } from 'react';

import { DataSourcePluginOptionsEditorProps } from 'src/packages/datav-core/src';

type Props = DataSourcePluginOptionsEditorProps<any>;

/**
 * Empty Config Editor -- settings to save
 */
export class ConfigEditor extends PureComponent<Props> {
  render() {
    return <div />;
  }
}
