import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { QueryEditorProps} from 'src/packages/datav-core/src';
import { LegacyForms} from 'src/packages/datav-core/src/ui';
import { JaegerDatasource,JaegerQuery } from './datasource';
import { defaultQuery } from './types'; 

const { FormField } = LegacyForms;

type Props = QueryEditorProps<JaegerDatasource, JaegerQuery>;

export class QueryEditor extends PureComponent<Props> {
  onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, queryText: event.target.value });
  }; 

  onConstantChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, constant: parseFloat(event.target.value) });
    // executes the query
    onRunQuery();
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { queryText, constant } = query;

    return (
        <></>
    //   <div className="gf-form">
    //     <FormField
    //       width={4}
    //       value={constant}
    //       onChange={this.onConstantChange}
    //       label="Constant"
    //       type="number"
    //       step="0.1"
    //     />
    //     <FormField
    //       labelWidth={8}
    //       value={queryText || ''}
    //       onChange={this.onQueryTextChange}
    //       label="Query Text"
    //       tooltip="Not used yet"
    //     />
    //   </div>
    );
  }
}