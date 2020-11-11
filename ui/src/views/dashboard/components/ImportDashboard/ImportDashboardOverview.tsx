import React, { PureComponent } from 'react';
import { Form, DataSourceSelectItem, locationUtil, getHistory } from 'src/packages/datav-core/src';
import { ImportDashboardForm } from './ImportDashboardForm';
import { getUrlParams } from 'src/core/library/utils/url';
import  {DashboardInputs,DashboardSource,ImportDashboardDTO}  from '../../model/import'
import {getBackendSrv} from 'src/core/services/backend'
interface Props {
    dashboard: ImportDashboardDTO;
    inputs: DashboardInputs;
    source: DashboardSource;
}


interface State {
    uidReset: boolean;
    folder: { id: number; title?: string }
}

export default class ImportDashboardOverview extends PureComponent<Props, State> {
    constructor(props) {
        super(props)
        const urlParams = getUrlParams()
        this.state = {
            uidReset: false,
            folder: urlParams.folderId ? { id: Number(urlParams.folderId) } : { id: 0 },
        };
    }

    onSubmit = async (form: ImportDashboardDTO) => {
        let inputsToPersist = [] as any[];
        // importDashboardForm.dataSources?.forEach((dataSource: DataSourceSelectItem, index: number) => {
        //   const input = this.props.inputs.dataSources[index];
        //   inputsToPersist.push({
        //     name: input.name,
        //     type: input.type,
        //     pluginId: input.pluginId,
        //     value: dataSource.value,
        //   });
        // });
    
        // importDashboardForm.constants?.forEach((constant: any, index: number) => {
        //   const input = inputs.constants[index];
    
        //   inputsToPersist.push({
        //     value: constant,
        //     name: input.name,
        //     type: input.type,
        //   });
        // });
        const res = await getBackendSrv().post('/api/dashboard/import', {
            dashboard: { ...this.props.dashboard, title: form.title, uid: form.uid },
            overwrite: true,
            inputs: inputsToPersist,
            folderId: form.folder.id,
        });

        const dashboardUrl = locationUtil.stripBaseFromUrl(res.data.url);
        getHistory().push(dashboardUrl)
    };

    onCancel = () => {
        // this.props.clearLoadedDashboard();
    };

    onUidReset = () => {
        this.setState({ uidReset: true });
    };

    render() {
        const { dashboard, inputs, source } = this.props;
        const { uidReset,folder } = this.state;

        return (
            <>
                <Form
                    onSubmit={this.onSubmit}
                    defaultValues={{ ...dashboard, constants: [], dataSources: [], folder: folder }}
                    validateOnMount
                    validateFieldsOnMount={['title', 'uid']}
                    validateOn="onChange"
                >
                    {({ register, errors, control, getValues }) => (
                        <ImportDashboardForm
                            register={register}
                            errors={errors}
                            control={control}
                            getValues={getValues}
                            uidReset={uidReset}
                            inputs={inputs}
                            onCancel={this.onCancel}
                            onUidReset={this.onUidReset}
                            onSubmit={this.onSubmit}
                            initialFolderId={folder.id}
                        />
                    )}
                </Form>
            </>
        );
    }
}

