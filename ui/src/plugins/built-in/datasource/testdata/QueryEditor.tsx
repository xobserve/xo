// Libraries
import React, { PureComponent } from 'react';
import _ from 'lodash';

// Services & Utils
import { getBackendSrv } from 'src/packages/datav-core/src';

// Components
import { InlineFormLabel, LegacyForms } from 'src/packages/datav-core/src';
import { QueryEditorProps, SelectableValue } from 'src/packages/datav-core/src';

// Types
import { TestDataDataSource } from './datasource';
import { TestDataQuery, Scenario } from './types';

const { LegacySelect: Select } = LegacyForms;

interface State {
  scenarioId: string;
  scenarioList: Scenario[];
  current: Scenario | null;
  alias: string
}

type Props = QueryEditorProps<TestDataDataSource, TestDataQuery>;

export class QueryEditor extends PureComponent<Props,State> {
  backendSrv = getBackendSrv();
  query: TestDataQuery;

  constructor(props:Props) {
    super(props)
    this.query = _.cloneDeep(props.query)
    this.state = {
      scenarioId: this.query.scenarioId,
      scenarioList: [],
      current: null,
      alias: this.query.alias
    }
  }


  async componentDidMount() {
    const { query, datasource } = this.props;

    query.scenarioId = query.scenarioId || 'random_walk';

    // const scenarioList = await backendSrv.get('/api/tsdb/testdata/scenarios');
    const scenarioList = [{"description":"","id":"arrow","name":"Load Apache Arrow Data","stringInput":""},{"description":"","id":"csv_metric_values","name":"CSV Metric Values","stringInput":"1,20,90,30,5,0"},{"description":"","id":"datapoints_outside_range","name":"Datapoints Outside Range","stringInput":""},{"description":"","id":"exponential_heatmap_bucket_data","name":"Exponential heatmap bucket data","stringInput":""},{"description":"","id":"grafana_api","name":"Grafana API","stringInput":""},{"description":"","id":"linear_heatmap_bucket_data","name":"Linear heatmap bucket data","stringInput":""},{"description":"","id":"logs","name":"Logs","stringInput":""},{"description":"","id":"manual_entry","name":"Manual Entry","stringInput":""},{"description":"","id":"no_data_points","name":"No Data Points","stringInput":""},{"description":"","id":"predictable_csv_wave","name":"Predictable CSV Wave","stringInput":""},{"description":"Predictable Pulse returns a pulse wave where there is a datapoint every timeStepSeconds.\nThe wave cycles at timeStepSeconds*(onCount+offCount).\nThe cycle of the wave is based off of absolute time (from the epoch) which makes it predictable.\nTimestamps will line up evenly on timeStepSeconds (For example, 60 seconds means times will all end in :00 seconds).","id":"predictable_pulse","name":"Predictable Pulse","stringInput":""},{"description":"","id":"random_walk","name":"Random Walk","stringInput":""},{"description":"","id":"random_walk_table","name":"Random Walk Table","stringInput":""},{"description":"","id":"random_walk_with_error","name":"Random Walk (with error)","stringInput":""},{"description":"","id":"server_error_500","name":"Server Error (500)","stringInput":""},{"description":"","id":"slow_query","name":"Slow Query","stringInput":"5s"},{"description":"","id":"streaming_client","name":"Streaming Client","stringInput":""},{"description":"","id":"table_static","name":"Table Static","stringInput":""}]
    const current: any = _.find(scenarioList, { id: query.scenarioId });

    this.setState({ scenarioList: scenarioList, current: current });
  }

  onScenarioChange = (item: SelectableValue<string>) => {
    this.query.scenarioId = item.value
    this.setState({
      ...this.state,
      scenarioId: item.value
    })
    this.onRunQuery()
  };

  onAliasChange = (v : string) => {
    this.query.alias = v
    this.setState({
      ...this.state,
      alias: v
    })
  }

  onRunQuery = () => {
    const { query } = this;
    this.props.onChange(query);
    this.props.onRunQuery();
  };

  render() {
    const {scenarioId,alias} = this.state
    const options = this.state.scenarioList.map(item => ({ label: item.name, value: item.id }));
    const current = options.find(item => item.value === scenarioId);

    return (
      <div className="gf-form-inline">
        <div className="gf-form">
          <InlineFormLabel className="query-keyword" width={7}>
            Scenario
          </InlineFormLabel>
          <Select options={options} value={current} onChange={this.onScenarioChange} />
          <InlineFormLabel className="query-keyword" width={7}>
            Alias
          </InlineFormLabel>
          <input type="text" className="gf-form-input width-14" placeholder="optional" value={alias}
			    	onChange={(e) => this.onAliasChange(e.currentTarget.value)} onBlur={this.onRunQuery}/>
        </div>
      </div>
    );
  }
}
