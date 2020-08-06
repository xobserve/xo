import React  from 'react'
import _ from 'lodash'
import { DashboardModel } from '../../model';

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-solarized_light";
import "ace-builds/src-noconflict/theme-tomorrow_night_blue";
import { currentTheme, ThemeType, locationUtil } from 'src/packages/datav-core/src';
import {getBackendSrv} from 'src/core/services/backend'
 import { Button} from 'antd';
import { FormattedMessage } from 'react-intl';

interface Props {
    dashboard: DashboardModel
}

const JsonSetting = (props: Props) => {
    let json;
    return (
        <>
            <h3 className="dashboard-settings__header">
                <FormattedMessage id="dashboard.jsonMeta"/>
            </h3>

            <div className="dashboard-settings__subheader">
                <FormattedMessage id="dashboard.jsonMetaDesc"/>
            </div>

            <div className="gf-form">
                <AceEditor
                    style={{width:'100%',height: 'calc(100vh - 270px)'}}
                    placeholder="Placeholder Text"
                    mode="json"
                    theme={currentTheme === ThemeType.Light ?"solarized_light" : "tomorrow_night_blue"}
                    name="dashboard-json-editor"

                    fontSize={14}
                    showPrintMargin={false}
                    showGutter={true}
                    highlightActiveLine={true}
                    defaultValue={JSON.stringify(props.dashboard.getSaveModelClone(),null,4)}
                    onChange={(v) => {json = v}}
                    setOptions={{
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: true,
                        enableSnippets: false,
                        showLineNumbers: true,
                        tabSize: 2,
                    }} />
            </div>

            <div className="gf-form-button-row">
                <Button onClick={() => {
                    const parsedJson = JSON.parse(json)
                    getBackendSrv().saveDashboard(parsedJson, {
                        folderId: props.dashboard.meta.folderId || parsedJson.folderId,
                      }).then((res) => {
                        const newUrl = locationUtil.stripBaseFromUrl(res.data.url);
                        window.location.href = newUrl + '?settingView=dashboard_json'
                      })
                }}>
                    <FormattedMessage id="common.saveChanges"/>
                </Button>
            </div>
        </>
    )
}

export default JsonSetting;