import React, { PureComponent } from 'react';
import { LoadingPlaceholder, JSONFormatter, Icon } from 'src/packages/datav-core';

import appEvents from 'src/core/library/utils/app_events';
import { CopyToClipboard } from 'src/views/components/CopyToClipboard/CopyToClipboard';
import { DashboardModel, PanelModel } from 'src/views/dashboard/model';
import { getBackendSrv,AppEvents } from 'src/packages/datav-core';
import {Button} from 'antd'

export interface Props {
  dashboard: DashboardModel;
  panel: PanelModel;
}

interface State {
  isLoading: boolean;
  allNodesExpanded: boolean;
  testRuleResponse: {};
}

export class TestRuleResult extends PureComponent<Props, State> {
  readonly state: State = {
    isLoading: false,
    allNodesExpanded: null,
    testRuleResponse: {},
  };

  formattedJson: any;
  clipboard: any;

  componentDidMount() {
    this.testRule();
  }

  async testRule() {
    const { dashboard, panel } = this.props;

    // dashboard save model
    const model = dashboard.getSaveModelClone();

    // now replace panel to get current edits
    model.panels = model.panels.map(dashPanel => {
      return dashPanel.id === panel.editSourceId ? panel.getSaveModel() : dashPanel;
    });

    const payload = { dashboard: model, panelId: panel.id };

    this.setState({ isLoading: true });
    const res = await getBackendSrv().post(`/api/alerting/test/rule`, payload);
    this.setState({ isLoading: false, testRuleResponse:res.data });
  }

  setFormattedJson = (formattedJson: any) => {
    this.formattedJson = formattedJson;
  };

  getTextForClipboard = () => {
    return JSON.stringify(this.formattedJson, null, 2);
  };

  onClipboardSuccess = () => {
    appEvents.emit(AppEvents.alertSuccess, ['Content copied to clipboard']);
  };

  onToggleExpand = () => {
    this.setState(prevState => ({
      ...prevState,
      allNodesExpanded: !this.state.allNodesExpanded,
    }));
  };

  getNrOfOpenNodes = () => {
    if (this.state.allNodesExpanded === null) {
      return 3; // 3 is default, ie when state is null
    } else if (this.state.allNodesExpanded) {
      return 20;
    }
    return 1;
  };

  renderExpandCollapse = () => {
    const { allNodesExpanded } = this.state;

    const collapse = (
      <>
        <Icon name="minus-circle" /> Collapse All
      </>
    );
    const expand = (
      <>
        <Icon name="plus-circle" /> Expand All
      </>
    );
    return allNodesExpanded ? collapse : expand;
  };

  render() {
    const { testRuleResponse, isLoading } = this.state;

    if (isLoading === true) {
      return <LoadingPlaceholder text="Evaluating rule" />;
    }

    const openNodes = this.getNrOfOpenNodes();

    return (
      <>
        <div className="pull-right">
          <Button size="small" type="primary" ghost onClick={this.onToggleExpand}>
            {this.renderExpandCollapse()}
          </Button>
          {/* <CopyToClipboard
            text={this.getTextForClipboard}
            onSuccess={this.onClipboardSuccess}
          >
            <Button size="small" type="primary" ghost onClick={this.onToggleExpand}>
              <Icon name="copy" /> Copy to Clipboard
            </Button>
          </CopyToClipboard> */}
        </div>

        <JSONFormatter json={testRuleResponse} open={openNodes} onDidRender={this.setFormattedJson} />
      </>
    );
  }
}
