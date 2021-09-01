import _ from 'lodash'
import { Emitter } from 'src/core/library/utils/emitter';
import { PanelEvents, DataQuery, ScopedVars, DataTransformerConfig, PanelPlugin, FieldConfigSource, DataLink, AppEvents, config, PanelPluginDataSupport, eventFactory } from 'src/packages/datav-core/src'
import {getTheme} from 'src/packages/datav-core/src/ui'
import templateSrv from 'src/core/services/templating'
import { getNextRefIdChar } from 'src/core/library/utils/query'
import { PanelQueryRunner } from './PanelQueryRunner'
import { EDIT_PANEL_ID } from 'src/core/constants';
import { CoreEvents } from 'src/types';
import { getDatasourceSrv } from 'src/core/services/datasource';
import { getTheme2 } from 'src/packages/datav-core/src/ui/themes/getTheme';

export const panelAdded = eventFactory<PanelModel | undefined>('panel-added');
export const panelRemoved =eventFactory<PanelModel | undefined>('panel-removed');


export interface GridPos {
    x: number;
    y: number;
    w: number;
    h: number;
    static?: boolean;
}

const notPersistedProperties: { [str: string]: boolean } = {
    events: true,
    isViewing: true,
    isEditing: true,
    isInView: true,
    hasRefreshed: true,
    cachedPluginOptions: true,
    plugin: true,
    queryRunner: true,
    replaceVariables: true,
    editSourceId: true,
};

const mustKeepProps: { [str: string]: boolean } = {
    id: true,
    gridPos: true,
    type: true,
    title: true,
    scopedVars: true,
    repeat: true,
    repeatIteration: true,
    repeatPanelId: true,
    repeatDirection: true,
    repeatedByRow: true,
    minSpan: true,
    collapsed: true,
    panels: true,
    targets: true,
    datasource: true,
    timeFrom: true,
    timeShift: true,
    hideTimeOverride: true,
    description: true,
    links: true,
    fullscreen: true,
    isEditing: true,
    hasRefreshed: true,
    events: true,
    cacheTimeout: true,
    cachedPluginOptions: true,
    transparent: true,
    pluginVersion: true,
    queryRunner: true,
    transformations: true,
    fieldConfig: true,
    editSourceId: true,
    maxDataPoints: true,
    interval: true,
    renderCondition: true
};

const defaults: any = {
    gridPos: { x: 0, y: 0, h: 3, w: 6 },
    targets: [{ refId: 'A' }],
    cachedPluginOptions: {},
    transparent: false,
    options: {},
    datasource: null,
    renderCondition: ""
};

export class PanelModel {
    id: number;
    editSourceId: number;
    gridPos: GridPos;
    type: string;
    title: string;
    datasource: string;
    alert?: any;
    targets: DataQuery[];
    scopedVars?: ScopedVars;
    transformations?: DataTransformerConfig[];
    fieldConfig: FieldConfigSource;
    maxDataPoints?: number;
    interval?: string;
    options: {
        [key: string]: any;
    };
    transparent: boolean;
    description?: string;
    links?: DataLink[];
    panels?: any;
    timeFrom?: any;
    timeShift?: any;
    hideTimeOverride?: any;

    repeat?: string;
    repeatIteration?: number;
    repeatPanelId?: number;
    repeatDirection?: string;
    repeatedByRow?: boolean;
    maxPerRow?: number;
    collapsed?: boolean;

    pluginVersion?: string;

    thresholds?: any;
    renderCondition? : string

    // non persisted
    isViewing: boolean;
    isEditing: boolean;
    events: Emitter;
    hasRefreshed: boolean;
    isInView: boolean;
    plugin?: PanelPlugin;
    cacheTimeout?: any;
    cachedPluginOptions?: any;
    
    private queryRunner?: PanelQueryRunner;

    constructor(model: any) {
        this.events = new Emitter();
        this.restoreModel(model);
        this.replaceVariables = this.replaceVariables.bind(this);
    }

    /** Given a persistened PanelModel restores property values */
    restoreModel(model: any) {
        // Start with clean-up
        for (const property in this) {
            if (notPersistedProperties[property] || !this.hasOwnProperty(property)) {
                continue;
            }

            if (model[property]) {
                continue;
            }

            if (typeof (this as any)[property] === 'function') {
                continue;
            }

            if (typeof (this as any)[property] === 'symbol') {
                continue;
            }

            delete (this as any)[property];
        }

        // copy properties from persisted model
        for (const property in model) {
            (this as any)[property] = model[property];
        }

        // defaults
        _.defaultsDeep(this, _.cloneDeep(defaults));

        // queries must have refId
        this.ensureQueryIds();
    }

    ensureQueryIds() {
        if (this.targets && _.isArray(this.targets)) {
            for (const query of this.targets) {
                if (!query.refId) {
                    query.refId = getNextRefIdChar(this.targets);
                }
            }
        }
    }

    replaceVariables(value: string, extraVars?: ScopedVars, format?: string) {
        let vars = this.scopedVars;
        if (extraVars) {
            vars = vars ? { ...vars, ...extraVars } : extraVars;
        }
        return templateSrv.replace(value, vars, format);
    }

    
    updateQueries(queries: DataQuery[]) {
        this.events.emit(CoreEvents.queryChanged);
        this.targets = queries;
      }

    updateGridPos(newPos: GridPos) {
        let sizeChanged = false;

        if (this.gridPos.w !== newPos.w || this.gridPos.h !== newPos.h) {
            sizeChanged = true;
        }

        this.gridPos.x = newPos.x;
        this.gridPos.y = newPos.y;
        this.gridPos.w = newPos.w;
        this.gridPos.h = newPos.h;

        if (sizeChanged) {
            this.events.emit(PanelEvents.sizeChanged);
        }
    }

    resizeDone() {
        this.events.emit(PanelEvents.sizeChanged);
    }

    initialized() {
        this.events.emit(PanelEvents.initialized);
    }

    refresh() {
        this.hasRefreshed = true;
        this.events.emit(PanelEvents.refresh);
    }

    setIsViewing(isViewing: boolean) {
        this.isViewing = isViewing;
    }

    getQueryRunner(): PanelQueryRunner {
        if (!this.queryRunner) {
            this.queryRunner = new PanelQueryRunner(this);
        }
        return this.queryRunner;
    }

    getDataSupport(): PanelPluginDataSupport {
        return this.plugin?.dataSupport ?? { annotations: false, alertStates: false };
    }

    getTransformations() {
        return this.transformations;
    }

    getFieldOverrideOptions() {
        if (!this.plugin) {
          return undefined;
        }
    
        return {
          fieldConfig: this.fieldConfig,
          replaceVariables: this.replaceVariables,
          getDataSourceSettingsByUid: getDatasourceSrv().getDataSourceSettingsByUid.bind(getDatasourceSrv()),
          fieldConfigRegistry: this.plugin.fieldConfigRegistry,
          theme: getTheme2(),
        };
      }

    getFieldConfig() {
        return this.fieldConfig;
    }

    updateOptions(options: object) {
        this.options = options;
        this.render();
    }

    getOptions() {
        return this.options;
    }

    render() {
        if (!this.hasRefreshed) {
            this.refresh();
        } else {
            this.events.emit(PanelEvents.render);
        }
    }

    updateFieldConfig(config: FieldConfigSource) {
        this.fieldConfig = config;

        this.resendLastResult();
        this.render();
    }

    resendLastResult() {
        if (!this.plugin) {
            return;
        }

        this.getQueryRunner().resendLastResult();
    }

    hasTitle() {
        return this.title && this.title.length > 0;
    }

    getSaveModel() {
        const model: any = {};

        for (const property in this) {
            if (notPersistedProperties[property] || !this.hasOwnProperty(property)) {
                continue;
            }

            if (_.isEqual(this[property], defaults[property])) {
                continue;
            }

            model[property] = _.cloneDeep(this[property]);
        }

        if (model.datasource === undefined) {
            // This is part of defaults as defaults are removed in save model and
            // this should not be removed in save model as exporter needs to templatize it
            model.datasource = null;
        }

        return model;
    }

    pluginLoaded(plugin: PanelPlugin) {
        this.plugin = plugin;

        this.applyPluginOptionDefaults(plugin);
        this.resendLastResult();
    }

    getEditClone() {
        const sourceModel = this.getSaveModel();

        // Temporary id for the clone, restored later in redux action when changes are saved
        sourceModel.id = EDIT_PANEL_ID;
        sourceModel.editSourceId = this.id;

        const clone = new PanelModel(sourceModel);
        clone.isEditing = true;
        const sourceQueryRunner = this.getQueryRunner();

        // Copy last query result
        clone.getQueryRunner().useLastResultFrom(sourceQueryRunner);

        return clone;
    }

    destroy() {
        this.events.emit(PanelEvents.panelTeardown);
        this.events.removeAllListeners();

        if (this.queryRunner) {
            this.queryRunner.destroy();
        }
    }

    changeQuery(query: DataQuery, index: number) {
        // ensure refId is maintained
        query.refId = this.targets[index].refId;

        // update query in array
        this.targets = this.targets.map((item, itemIndex) => {
            if (itemIndex === index) {
                return query;
            }
            return item;
        });
    }

    private applyPluginOptionDefaults(plugin: PanelPlugin) {
        this.options = _.mergeWith({}, plugin.defaults, this.options || {}, (objValue: any, srcValue: any): any => {
            if (_.isArray(srcValue)) {
                return srcValue;
            }
        });

        this.fieldConfig = {
            defaults: _.mergeWith(
                {},
                plugin.fieldConfigDefaults.defaults,
                this.fieldConfig ? this.fieldConfig.defaults : {},
                (objValue: any, srcValue: any): any => {
                    if (_.isArray(srcValue)) {
                        return srcValue;
                    }
                }
            ),
            overrides: [
                ...plugin.fieldConfigDefaults.overrides,
                ...(this.fieldConfig && this.fieldConfig.overrides ? this.fieldConfig.overrides : []),
            ],
        };
    }

    setTransformations(transformations: DataTransformerConfig[]) {
        this.transformations = transformations;
        this.resendLastResult();
      }
      
    changePlugin(newPlugin: PanelPlugin) {
        const pluginId = newPlugin.meta.id;
        const oldOptions: any = this.getOptionsToRemember();
        const oldPluginId = this.type;

        // remove panel type specific  options
        for (const key of _.keys(this)) {
            if (mustKeepProps[key]) {
                continue;
            }

            delete (this as any)[key];
        }

        this.cachedPluginOptions[oldPluginId] = oldOptions;
        this.restorePanelOptions(pluginId);

        // Let panel plugins inspect options from previous panel and keep any that it can use
        if (newPlugin.onPanelTypeChanged) {
            let old: any = {};

            this.options = this.options || {};
            Object.assign(this.options, newPlugin.onPanelTypeChanged(this, oldPluginId, oldOptions.options,this.fieldConfig));
        }

        // switch
        this.type = pluginId;
        this.plugin = newPlugin;

        // For some reason I need to rebind replace variables here, otherwise the viz repeater does not work
        this.replaceVariables = this.replaceVariables.bind(this);
        this.applyPluginOptionDefaults(newPlugin);

        if (newPlugin.onPanelMigration) {
            this.pluginVersion = getPluginVersion(newPlugin);
        }

    }

    private getOptionsToRemember() {
        return Object.keys(this).reduce((acc, property) => {
            if (notPersistedProperties[property] || mustKeepProps[property]) {
                return acc;
            }
            return {
                ...acc,
                [property]: (this as any)[property],
            };
        }, {});
    }

    private restorePanelOptions(pluginId: string) {
        const prevOptions = this.cachedPluginOptions[pluginId] || {};

        Object.keys(prevOptions).map(property => {
            (this as any)[property] = prevOptions[property];
        });
    }


    /*
   * Panel have a different id while in edit mode (to more easily be able to discard changes)
   * Use this to always get the underlying source id
   * */
    getSavedId(): number {
        return this.editSourceId ?? this.id;
    }

      /*
   * This is the title used when displaying the title in the UI so it will include any interpolated variables.
   * If you need the raw title without interpolation use title property instead.
   * */
  getDisplayTitle(): string {
    return this.replaceVariables(this.title, {}, 'text');
  }
}


function getPluginVersion(plugin: PanelPlugin): string {
    return plugin && plugin.meta.info.version ? plugin.meta.info.version : config.buildInfo.version;
}