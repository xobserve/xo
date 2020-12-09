import React, { PureComponent } from 'react';
import _ from 'lodash';
import { NavModel, DataSourcePluginMeta, getBootConfig, DataSourcePlugin, DataSourceApi, DataQuery, DataSourceJsonData, DataSourceSettings, getBackendSrv, setBootConfig, currentLang, getHistory } from 'src/packages/datav-core/src'
import { InlineFormLabel, LegacyForms, ConfirmModal, Button } from 'src/packages/datav-core/src'
import { withRouter } from 'react-router-dom';
import { Input, notification, Alert } from 'antd';

import Page from 'src/views/Layouts/Page/Page';
import { loadDataSourcePlugin, testDataSource } from 'src/plugins/loader';
import { PluginSettings } from './PluginSettings'
import globalEvents from 'src/views/App/globalEvents';
import { connect } from 'react-redux';
import { StoreState } from 'src/types'
import localeData from 'src/core/library/locale'
import { getState } from 'src/store/store';
import { FormattedMessage } from 'react-intl';

const { LegacySwitch } = LegacyForms

type GenericDataSourcePlugin = DataSourcePlugin<DataSourceApi<DataQuery, DataSourceJsonData>>;
interface Props {
    match: any
    history: any
    locale: string
}



interface State {
    mode: string
    dataSource: DataSourceSettings;
    datasourceMeta: DataSourcePluginMeta
    navModel: NavModel
    plugin?: GenericDataSourcePlugin
    hasFetched: boolean
    testingStatus?: {
        status: boolean
        message?: any
    }
    confirmVisible: boolean
}

enum DatasourceMode {
    New = "new",
    Edit = "edit"
}

const layout = {
    wrapperCol: { span: 16 },
    labelCol: { span: 16 }
};

export class EditDataSourcePage extends PureComponent<Props, State> {
    constructor(props) {
        super(props)
        const datasourceId = _.toNumber(this.props.match.params.datasourceID)
        let mode = DatasourceMode.Edit
        if (!datasourceId) {
            // not number, new datasource mode, otherwise, edit datasource mode
            mode = DatasourceMode.New
        }


        let ds;
        if (mode === DatasourceMode.New) {
            ds = {
                isDefault: Object.keys(getBootConfig().datasources).length === 0,
                name: '',
                url: '',
                jsonData: {
                }
            }
        }

        let meta: DataSourcePluginMeta;
        let node = {} as any
        let hasFetched = false
        if (mode === DatasourceMode.New) {
            meta = getBootConfig().datasourceMetas[this.props.match.params.datasourceID]
            ds.type = meta.id
            node = {
                img: meta.info.logos.small,
                id: 'datasource-new',
                title: localeData[currentLang]['datasource.add'],
                href: 'datasources/new',
                subTitle:  localeData[currentLang]['common.type'] + ': ' + meta.name,
            }
            hasFetched = true
        }


        this.state = {
            mode: mode,
            datasourceMeta: meta,
            navModel: {
                main: node,
                node: node,
            },
            dataSource: ds,
            hasFetched: hasFetched,
            confirmVisible: false
        }

        this.onFinish = this.onFinish.bind(this)
    }

    async componentWillMount() {
        if (this.state.mode === DatasourceMode.Edit) {
            const res = await getBackendSrv().get(`/api/datasources/${this.props.match.params.datasourceID}`)
            const ds: DataSourceSettings = res.data
            const meta = getBootConfig().datasourceMetas[ds.type]
            const node = {
                img: meta.info.logos.small,
                id: 'datasource-new',
                title: localeData[getState().application.locale]['datasource.edit'],
                href: 'datasources/new',
                subTitle: localeData[getState().application.locale]['common.type'] + ' : ' + meta.name,
            }

            this.setState({
                ...this.state,
                dataSource: ds,
                datasourceMeta: meta,
                hasFetched: true,
                navModel: {
                    main: node,
                    node: node,
                },
            })
        }

        const plugin = await loadDataSourcePlugin(this.state.datasourceMeta.id)
        this.setState({
            ...this.state,
            plugin
        })

    }

    async delDataSource() {
        const res = await getBackendSrv().delete(`/api/datasources/${this.state.dataSource.id}`)

        const res1 = await getBackendSrv().get('/api/bootConfig');
        setBootConfig(res1.data)

        if (res.status === 'success') {
            globalEvents.showMessage(() => notification['success']({
                message: "Success",
                description: localeData[currentLang]['info.targetDeleted'],
                duration: 5
            }))


            this.props.history.push('/cfg/datasources')
        }
    }

    async onFinish() {
        if (_.isEmpty(this.state.dataSource.name)) {
            notification['error']({
                message: "Error",
                description: localeData[currentLang]['datasource.nameEmpty'],
                duration: 5
            })
            return 
        }
        // save options to backend
        if (this.state.mode === DatasourceMode.New) {
            const res = await getBackendSrv().post('/api/datasources/new', this.state.dataSource)
            const res1 = await getBackendSrv().get('/api/bootConfig');
            setBootConfig(res1.data)
            // replace url with datasource id
            this.props.history.replace('/datasources/edit/' + res.data.id)
            this.setState({
                ...this.state,
                dataSource: res.data,
                mode: DatasourceMode.Edit
            })
        } else {
            getBackendSrv().put('/api/datasources/edit', this.state.dataSource)
        }


        testDataSource(this.state.dataSource.name).then(() => {
            this.setState({
                ...this.state,
                testingStatus: {
                    status: true
                }
            })
        }).catch((err) => {
            this.setState({
                ...this.state,
                testingStatus: {
                    status: true,
                    message: err.message ?? err.data.message
                }
            })
        })
    };

    onFinishFailed(errorInfo) {
        console.log('Failed:', errorInfo);
    };

    onModelChange = (dataSource: DataSourceSettings) => {
        this.setState({
            ...this.state,
            dataSource
        })
    };
    render() {
        const { locale } = this.props
        return (
            <Page navModel={this.state.navModel}>
                <Page.Contents isLoading={!this.state.hasFetched}>
                    {
                        this.state.hasFetched &&
                        <>
                            <h3 className="page-heading"><FormattedMessage id="common.basicSetting" /></h3>
                            <div className="gf-form-group">
                                <div className="gf-form-inline">
                                    <div className="gf-form max-width-30" style={{ marginRight: '3px' }}>
                                        <InlineFormLabel
                                            tooltip={<FormattedMessage id="datasource.nameTooltip" />}
                                        >
                                            <FormattedMessage id="common.name" />
                                        </InlineFormLabel>
                                        <Input placeholder="Name" defaultValue={this.state.dataSource.name} onChange={(e) => { this.setState({ ...this.state, dataSource: { ...this.state.dataSource, name: e.currentTarget.value } }) }} />
                                    </div>
                                    <LegacySwitch
                                        label={localeData[locale]['common.default']}
                                        checked={this.state.dataSource.isDefault}
                                        //@ts-ignore
                                        onChange={(e) => { this.setState({ ...this.state, dataSource: { ...this.state.dataSource, isDefault: e.target.checked } }) }}
                                    />
                                </div>
                            </div>
                            {this.state.plugin && (
                                <PluginSettings
                                    plugin={this.state.plugin}
                                    dataSource={this.state.dataSource}
                                    dataSourceMeta={this.state.datasourceMeta}
                                    onChange={this.onModelChange}
                                />
                            )}
                            <div className="gf-form-group max-width-30">
                                {
                                    this.state.testingStatus && this.state.testingStatus.status && !this.state.testingStatus.message && <Alert
                                        className="ub-mb2"
                                        message={<FormattedMessage id="common.congratulations" />}
                                        description={<FormattedMessage id="datasource.isWorking" />}
                                        type="success"
                                        showIcon
                                    />
                                }
                                {
                                    this.state.testingStatus && this.state.testingStatus.status && this.state.testingStatus.message && <Alert
                                        className="ub-mb2"
                                        message={<FormattedMessage id="datasource.testFailed" />}
                                        description={this.state.testingStatus.message}
                                        type="error"
                                        showIcon
                                    />
                                }
                                <Button variant="primary" onClick={() => this.onFinish()}>
                                    <FormattedMessage id="common.save" /> & <FormattedMessage id="common.test" />
                                </Button>

                                <Button variant="destructive" className="ub-ml2" onClick={() => this.setState({ ...this.state, confirmVisible: true })}>
                                    <FormattedMessage id="common.delete" />
                                </Button>

                                <Button variant="secondary" className="ub-ml2" onClick={() => getHistory().push('/cfg/datasources')}>
                                    <FormattedMessage id="common.back" />
                                </Button>

                                <ConfirmModal
                                    isOpen={this.state.confirmVisible}
                                    title={localeData[locale]['datasource.delete']}
                                    body={<FormattedMessage id="datasource.deleteTitle" />}
                                    confirmText={<FormattedMessage id="common.delete" />}
                                    onConfirm={() => this.delDataSource()}
                                    onDismiss={() => this.setState({ ...this.state, confirmVisible: false })}
                                />

                            </div>
                        </>
                    }
                </Page.Contents>
            </Page>
        );
    }
}



export const mapStateToProps = (state: StoreState) => ({
    locale: state.application.locale
});



export default withRouter(connect(mapStateToProps)(EditDataSourcePage));