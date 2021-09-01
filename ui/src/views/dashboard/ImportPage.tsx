import React, { FormEvent, PureComponent } from 'react';
import { css } from 'emotion';
import { AppEvents, NavModel, getBootConfig } from 'src/packages/datav-core/src';
import {  DataSourceInstanceSettings,DataSourceSelectItem } from 'src/packages/datav-core/src';
import {stylesFactory, Input, TextArea, Field, Form,} from 'src/packages/datav-core/src/ui';
import Page from 'src/views/Layouts/Page/Page';
// import { ImportDashboardOverview } from './components/ImportDashboardOverview';
import { validateDashboardJson, validateGcomDashboard } from './utils/validation';

import appEvents from 'src/core/library/utils/app_events';
import { getNavModel } from '../Layouts/Page/navModel';
import ImportDashboardOverview from './components/ImportDashboard/ImportDashboardOverview'
import  {DashboardInputs,InputType,DashboardSource}  from './model/import'
import { FormattedMessage } from 'react-intl';
import Button from 'antd/es/button';




interface Props {
    routeID: string;
    parentRouteID: string;
}

interface State {
    isLoaded: boolean
    dashboard: any
    source: DashboardSource.Json
    inputs: DashboardInputs
}

class DashboardImportUnConnected extends PureComponent<Props, State> {
    constructor(props) {
        super(props)
        this.state = {
            isLoaded: false,
            dashboard: {},
            source: DashboardSource.Json,
            inputs: {} as DashboardInputs
        }
    }
    onFileUpload = (event: FormEvent<HTMLInputElement>) => {
        // const { importDashboardJson } = this.props;
        // const file = event.currentTarget.files && event.currentTarget.files.length > 0 && event.currentTarget.files[0];

        // if (file) {
        //   const reader = new FileReader();
        //   const readerOnLoad = () => {
        //     return (e: any) => {
        //       let dashboard: any;
        //       try {
        //         dashboard = JSON.parse(e.target.result);
        //       } catch (error) {
        //         appEvents.emit(AppEvents.alertError, [
        //           'Import failed',
        //           'JSON -> JS Serialization failed: ' + error.message,
        //         ]);
        //         return;
        //       }
        //       importDashboardJson(dashboard);
        //     };
        //   };
        //   reader.onload = readerOnLoad();
        //   reader.readAsText(file);
        // }
    };

    getDashboardFromJson = (formData: { dashboardJson: string }) => {
        this.importDashboardJson(JSON.parse(formData.dashboardJson));
    };

    importDashboardJson = (dashboard) => {
        const inputs = this.processInputs(dashboard)
        this.setState({
            ...this.state,
            dashboard: {
                ...dashboard,
                id: null
            },
            source: DashboardSource.Json,
            inputs: {
                dataSources: inputs.filter(p => p.type === InputType.DataSource),
                constants: inputs.filter(p => p.type === InputType.Constant),
              },
            isLoaded: true
        })
    }

    processInputs(dashboardJson: any) {
        const inputs: any[] = [];
        if (dashboardJson && dashboardJson.__inputs) {
            dashboardJson.__inputs.forEach((input: any) => {
                const inputModel: any = {
                    name: input.name,
                    label: input.label,
                    info: input.description,
                    value: input.value,
                    type: input.type,
                    pluginId: input.pluginId,
                    options: [],
                };

                if (input.type === InputType.DataSource) {
                    this.getDataSourceOptions(input, inputModel);
                } else if (!inputModel.info) {
                    inputModel.info = 'Specify a string constant';
                }

                inputs.push(inputModel);
            });
        }
        return inputs
    }

    getDataSourceOptions = (input: { pluginId: string; pluginName: string }, inputModel: any) => {
        const sources = Object.values(getBootConfig().datasources).filter(
            (val: DataSourceInstanceSettings) => val.type === input.pluginId
        );

        if (sources.length === 0) {
            inputModel.info = 'No data sources of type ' + input.pluginName + ' found';
        } else if (!inputModel.info) {
            inputModel.info = 'Select a ' + input.pluginName + ' data source';
        }

        inputModel.options = sources.map(val => {
            return { name: val.name, value: val.name, meta: val.meta };
        });
    };
    getGcomDashboard = (formData: { gcomDashboard: string }) => {
        // let dashboardId;
        // const match = /(^\d+$)|dashboards\/(\d+)/.exec(formData.gcomDashboard);
        // if (match && match[1]) {
        //   dashboardId = match[1];
        // } else if (match && match[2]) {
        //   dashboardId = match[2];
        // }

        // if (dashboardId) {
        //   this.props.fetchGcomDashboard(dashboardId);
        // }
    };

    renderImportForm() {
        const styles = importStyles();

        return (
            <>
                <div className={styles.option}>
                    {/* <DashboardFileUpload onFileUpload={this.onFileUpload} /> */}
                </div>
                <div className={styles.option}>
                    <h3><FormattedMessage id="dashboard.importTip"/></h3>
                    <Form onSubmit={this.getDashboardFromJson} defaultValues={{ dashboardJson: '' }}>
                        {({ register, errors }) => (
                            <>
                                <Field invalid={!!errors.dashboardJson} error={errors.dashboardJson && errors.dashboardJson.message}>
                                    <TextArea
                                        {...register("dashboardJson",{
                                            required: 'Need a dashboard json model',
                                            validate: validateDashboardJson,
                                        })}
                                        rows={10}
                                    />
                                </Field>
                                <Button htmlType="submit" type="primary"><FormattedMessage id="common.submit"/></Button>
                            </>
                        )}
                    </Form>
                </div>
            </>
        );
    }

    render() {
        const { routeID, parentRouteID } = this.props
        const navModel = getNavModel(routeID, parentRouteID)
        const { isLoaded ,dashboard,inputs,source} = this.state
        return (
            <Page navModel={navModel}>
                <Page.Contents>{isLoaded ? <ImportDashboardOverview dashboard={dashboard} source={source} inputs={inputs}/> : this.renderImportForm()}</Page.Contents>
            </Page>
        );
    }
}

export default DashboardImportUnConnected

const importStyles = stylesFactory(() => {
    return {
        option: css`
      margin-bottom: 32px;
    `,
    };
});
