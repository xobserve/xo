import _, { isEqual } from 'lodash'
import { PanelModel } from './PanelModel'
import { Emitter } from 'src/core/library/utils/emitter'
import { AppEvent, PanelEvents,dateTimeFormat,DateTimeInput,config} from 'src/packages/datav-core/src'
import { DashboardMeta, CoreEvents, GlobalVariableUid } from 'src/types'
import {GRID_COLUMN_COUNT,REPEAT_DIR_VERTICAL} from 'src/core/constants'
import {panelAdded,panelRemoved,GridPos} from './PanelModel'
import { getTimeSrv } from 'src/core/services/time'
import {GetVariables,getVariables} from 'src/views/variables/state/selectors'
import { variableAdapters } from 'src/views/variables/adapters'
import sortByKeys from 'src/core/library/utils/sortByKeys'
import { annotationsSrv } from 'src/core/services/annotations'

export interface CloneOptions {
  saveVariables?: boolean;
  message?: string;
}
type DashboardLinkType = 'link' | 'dashboards';

export interface DashboardLink {
  icon: string;
  title: string;
  tooltip: string;
  type: DashboardLinkType;
  url: string;
  asDropdown: boolean;
  tags: any[];
  searchHits?: any[];
  targetBlank: boolean;
}


export class DashboardModel {
    id: any;
    uid: string;
    title: string;
    editable: boolean;
    panels: PanelModel[];
    tags: string[];
    panelInEdit?: PanelModel;
    panelInView: PanelModel;
    graphTooltip: any;
    timezone: any;
    annotations: { list: any[] };
    templating: { list: any[] };
    links: DashboardLink[];
    description: string;
    schemaVersion: number;
    version: number;
    enableGlobalVariable: boolean;
    autoSave: boolean;
    showHeader: boolean
    variablesDiplay: string[]
    private originalTemplating: any;

     // ------------------
  // not persisted
  // ------------------

  // repeat process cycles
    iteration: number;
    events: Emitter;
    meta: DashboardMeta;

    static nonPersistedProperties: { [str: string]: boolean } = {
      events: true,
      meta: true,
      panels: true, // needs special handling
      templating: true, // needs special handling
      originalTemplating: true,
      panelInEdit: true,
      panelInView: true,
      getVariablesFromState: true,
    };

    constructor(data: any,meta?: DashboardMeta,private getVariablesFromState: GetVariables = getVariables) {
        if (!data) {
            data = {}
        }

        this.events = new Emitter();
        this.id = data.id || null;
        this.uid = data.uid || null;
        this.title = data.title || 'No Title';
        this.graphTooltip = data.graphTooltip || 0;
        this.tags = data.tags || [];
        this.editable = data.editable !== false;
        this.enableGlobalVariable = data.enableGlobalVariable;
        this.autoSave = data.autoSave;
        this.showHeader = data.showHeader
        this.variablesDiplay = data.variablesDiplay || []
        this.panels =  _.map(data.panels || [], (panelData: any) => new PanelModel(panelData));
        this.description = data.description || 'A new dashboard';

        this.templating = this.ensureListExist(data.templating);
        this.annotations = this.ensureListExist(data.annotations);

        this.meta = meta || {
            canEdit: true
        }
        this.links = data.links || [];

        this.schemaVersion = data.schemaVersion || 0;
        this.version = data.version || 0;
        
        this.timezone = getTimeSrv().timezone

        this.resetOriginalVariables(true);

        this.sortPanelsByGridPos();
    }

    on<T>(event: AppEvent<T>, callback: (payload?: T) => void) {
        this.events.on(event, callback);
    }

    off<T>(event: AppEvent<T>, callback?: (payload?: T) => void) {
        this.events.off(event, callback);
    }

    sortPanelsByGridPos() {
        this.panels.sort((panelA, panelB) => {
            if (panelA.gridPos.y === panelB.gridPos.y) {
                return panelA.gridPos.x - panelB.gridPos.x;
            } else {
                return panelA.gridPos.y - panelB.gridPos.y;
            }
        });
    }

    otherPanelInFullscreen(panel: PanelModel) {
        return (this.panelInEdit || this.panelInView) && !(panel.isViewing || panel.isEditing);
    }

    setPanelFocus(id: number) {
        this.meta.focusPanelId = id;
    }

    panelInitialized(panel: PanelModel) {
        panel.initialized();

        const lastResult = panel.getQueryRunner().getLastResult();
        if (!this.otherPanelInFullscreen(panel) && !lastResult) {
            panel.refresh();
        }
    }

    initEditPanel(sourcePanel: PanelModel): PanelModel {
      this.panelInEdit = sourcePanel.getEditClone();
      return this.panelInEdit;
    }

    exitPanelEditor() {
      this.panelInEdit.destroy();
      this.panelInEdit = undefined;
    }
    
    async startRefresh() {
        await annotationsSrv.getAnnotations()
        this.events.emit(PanelEvents.refresh);

        if (this.panelInEdit) {
            this.panelInEdit.refresh();
            return;
        }

        for (const panel of this.panels) {
            if (!this.otherPanelInFullscreen(panel)) {
                panel.refresh();
            }
        }
    }

    removePanel(panel: PanelModel) {
        const index = _.indexOf(this.panels, panel);
        this.panels.splice(index, 1);
        this.events.emit(panelRemoved, panel);
    }

    duplicatePanel(panel: PanelModel) {
        const newPanel = panel.getSaveModel();
        newPanel.id = this.getNextPanelId();

        delete newPanel.repeat;
        delete newPanel.repeatIteration;
        delete newPanel.repeatPanelId;
        delete newPanel.scopedVars;
        if (newPanel.alert) {
            delete newPanel.thresholds;
        }
        delete newPanel.alert;

        // does it fit to the right?
        if (panel.gridPos.x + panel.gridPos.w * 2 <= GRID_COLUMN_COUNT) {
            newPanel.gridPos.x += panel.gridPos.w;
        } else {
            // add below
            newPanel.gridPos.y += panel.gridPos.h;
        }

        this.addPanel(newPanel);
        return newPanel;
    }

    addPanel(panelData: any) {
        panelData.id = this.getNextPanelId();
    
        const panel = new PanelModel(panelData);
    
        this.panels.unshift(panel);
    
        this.sortPanelsByGridPos();
        
        this.events.emit(panelAdded, panel);
      }

    
  getNextPanelId() {
    let max = 0;

    for (const panel of this.panels) {
      if (panel.id > max) {
        max = panel.id;
      }

      if (panel.collapsed) {
        for (const rowPanel of panel.panels) {
          if (rowPanel.id > max) {
            max = rowPanel.id;
          }
        }
      }
    }

    return max + 1;
  }

  canEditPanel(panel?: PanelModel): boolean {
    return this.meta.canEdit && panel && !panel.repeatPanelId;
  }

  canEditPanelById(id: number): boolean {
    return this.canEditPanel(this.getPanelById(id));
  }

  cycleGraphTooltip() {
    this.graphTooltip = (this.graphTooltip + 1) % 3;
  }

  sharedTooltipModeEnabled() {
    return this.graphTooltip > 0;
  }

  sharedCrosshairModeOnly() {
    return this.graphTooltip === 1;
  }

  formatDate(date: DateTimeInput, format?: string) {
    return dateTimeFormat(date, {
      format,
      timeZone: this.timezone,
    });
  }

  getPanelById(id: number): PanelModel {
    if (this.panelInEdit && this.panelInEdit.id === id) {
      return this.panelInEdit;
    }

    for (const panel of this.panels) {
      if (panel.id === id) {
        return panel;
      }
    }
    return null;
  }

  expandParentRowFor(panelId: number) {
    for (const panel of this.panels) {
      if (panel.collapsed) {
        for (const rowPanel of panel.panels) {
          if (rowPanel.id === panelId) {
            this.toggleRow(panel);
            return;
          }
        }
      }
    }
  }
  
  removeRow(row: PanelModel, removePanels: boolean) {
    const needToogle = (!removePanels && row.collapsed) || (removePanels && !row.collapsed);

    if (needToogle) {
      this.toggleRow(row);
    }

    this.removePanel(row);
  }
  
  expandRows() {
    for (let i = 0; i < this.panels.length; i++) {
      const panel = this.panels[i];

      if (panel.type !== 'row') {
        continue;
      }

      if (panel.collapsed) {
        this.toggleRow(panel);
      }
    }
  }
  collapseRows() {
    for (let i = 0; i < this.panels.length; i++) {
      const panel = this.panels[i];

      if (panel.type !== 'row') {
        continue;
      }

      if (!panel.collapsed) {
        this.toggleRow(panel);
      }
    }
  }
  toggleRow(row: PanelModel) {
    const rowIndex = _.indexOf(this.panels, row);

    if (row.collapsed) {
      row.collapsed = false;
      const hasRepeat = _.some(row.panels as PanelModel[], (p: PanelModel) => p.repeat);

      if (row.panels.length > 0) {
        // Use first panel to figure out if it was moved or pushed
        const firstPanel = row.panels[0];
        const yDiff = firstPanel.gridPos.y - (row.gridPos.y + row.gridPos.h);

        // start inserting after row
        let insertPos = rowIndex + 1;
        // y max will represent the bottom y pos after all panels have been added
        // needed to know home much panels below should be pushed down
        let yMax = row.gridPos.y;

        for (const panel of row.panels) {
          // make sure y is adjusted (in case row moved while collapsed)
          // console.log('yDiff', yDiff);
          panel.gridPos.y -= yDiff;
          // insert after row
          this.panels.splice(insertPos, 0, new PanelModel(panel));
          // update insert post and y max
          insertPos += 1;
          yMax = Math.max(yMax, panel.gridPos.y + panel.gridPos.h);
        }

        const pushDownAmount = yMax - row.gridPos.y - 1;

        // push panels below down
        for (let panelIndex = insertPos; panelIndex < this.panels.length; panelIndex++) {
          this.panels[panelIndex].gridPos.y += pushDownAmount;
        }

        row.panels = [];

        if (hasRepeat) {
          this.processRowRepeats(row);
        }
      }

      // sort panels
      this.sortPanelsByGridPos();

      // emit change event
      this.events.emit(CoreEvents.rowExpanded);
      return;
    }

    const rowPanels = this.getRowPanels(rowIndex);

    // remove panels
    _.pull(this.panels, ...rowPanels);
    // save panel models inside row panel
    row.panels = _.map(rowPanels, (panel: PanelModel) => panel.getSaveModel());
    row.collapsed = true;

    // emit change event
    this.events.emit(CoreEvents.rowCollapsed);
  }

  processRowRepeats(row: PanelModel) {
    let rowPanels = row.panels;
    if (!row.collapsed) {
      const rowPanelIndex = _.findIndex(this.panels, (p: PanelModel) => p.id === row.id);
      rowPanels = this.getRowPanels(rowPanelIndex);
    }

    this.cleanUpRowRepeats(rowPanels);

    for (let i = 0; i < rowPanels.length; i++) {
      const panel = rowPanels[i];
      if (panel.repeat) {
        const panelIndex = _.findIndex(this.panels, (p: PanelModel) => p.id === panel.id);
        this.repeatPanel(panel, panelIndex);
      }
    }
  }

  cleanUpRowRepeats(rowPanels: PanelModel[]) {
    const panelsToRemove = [];
    for (let i = 0; i < rowPanels.length; i++) {
      const panel = rowPanels[i];
      if (!panel.repeat && panel.repeatPanelId) {
        panelsToRemove.push(panel);
      }
    }
    _.pull(rowPanels, ...panelsToRemove);
    _.pull(this.panels, ...panelsToRemove);
  }

  repeatPanel(panel: PanelModel, panelIndex: number) {
    const variable: any = this.getPanelRepeatVariable(panel);
    if (!variable) {
      return;
    }

    if (panel.type === 'row') {
      this.repeatRow(panel, panelIndex, variable);
      return;
    }

    const selectedOptions = this.getSelectedVariableOptions(variable);
    const maxPerRow = panel.maxPerRow || 4;
    let xPos = 0;
    let yPos = panel.gridPos.y;

    for (let index = 0; index < selectedOptions.length; index++) {
      const option = selectedOptions[index];
      let copy;

      copy = this.getPanelRepeatClone(panel, index, panelIndex);
      copy.scopedVars = copy.scopedVars || {};
      copy.scopedVars[variable.name] = option;

      if (panel.repeatDirection === REPEAT_DIR_VERTICAL) {
        if (index > 0) {
          yPos += copy.gridPos.h;
        }
        copy.gridPos.y = yPos;
      } else {
        // set width based on how many are selected
        // assumed the repeated panels should take up full row width
        copy.gridPos.w = Math.max(GRID_COLUMN_COUNT / selectedOptions.length, GRID_COLUMN_COUNT / maxPerRow);
        copy.gridPos.x = xPos;
        copy.gridPos.y = yPos;

        xPos += copy.gridPos.w;

        // handle overflow by pushing down one row
        if (xPos + copy.gridPos.w > GRID_COLUMN_COUNT) {
          xPos = 0;
          yPos += copy.gridPos.h;
        }
      }
    }
  }
  getPanelRepeatClone(sourcePanel: PanelModel, valueIndex: number, sourcePanelIndex: number) {
    // if first clone return source
    if (valueIndex === 0) {
      return sourcePanel;
    }

    const clone = new PanelModel(sourcePanel.getSaveModel());
    clone.id = this.getNextPanelId();

    // insert after source panel + value index
    this.panels.splice(sourcePanelIndex + valueIndex, 0, clone);

    clone.repeatIteration = this.iteration;
    clone.repeatPanelId = sourcePanel.id;
    clone.repeat = null;
    return clone;
  }

  getSelectedVariableOptions(variable: any) {
    let selectedOptions: any[];
    if (variable.current.text === 'All') {
      selectedOptions = variable.options.slice(1, variable.options.length);
    } else {
      selectedOptions = _.filter(variable.options, { selected: true });
    }
    return selectedOptions;
  }

  repeatRow(panel: PanelModel, panelIndex: number, variable: any) {
    const selectedOptions = this.getSelectedVariableOptions(variable);
    let yPos = panel.gridPos.y;

    function setScopedVars(panel: PanelModel, variableOption: any) {
      panel.scopedVars = panel.scopedVars || {};
      panel.scopedVars[variable.name] = variableOption;
    }

    for (let optionIndex = 0; optionIndex < selectedOptions.length; optionIndex++) {
      const option = selectedOptions[optionIndex];
      const rowCopy = this.getRowRepeatClone(panel, optionIndex, panelIndex);
      setScopedVars(rowCopy, option);

      const rowHeight = this.getRowHeight(rowCopy);
      const rowPanels = rowCopy.panels || [];
      let panelBelowIndex;

      if (panel.collapsed) {
        // For collapsed row just copy its panels and set scoped vars and proper IDs
        _.each(rowPanels, (rowPanel: PanelModel, i: number) => {
          setScopedVars(rowPanel, option);
          if (optionIndex > 0) {
            this.updateRepeatedPanelIds(rowPanel, true);
          }
        });
        rowCopy.gridPos.y += optionIndex;
        yPos += optionIndex;
        panelBelowIndex = panelIndex + optionIndex + 1;
      } else {
        // insert after 'row' panel
        const insertPos = panelIndex + (rowPanels.length + 1) * optionIndex + 1;
        _.each(rowPanels, (rowPanel: PanelModel, i: number) => {
          setScopedVars(rowPanel, option);
          if (optionIndex > 0) {
            const cloneRowPanel = new PanelModel(rowPanel);
            this.updateRepeatedPanelIds(cloneRowPanel, true);
            // For exposed row additionally set proper Y grid position and add it to dashboard panels
            cloneRowPanel.gridPos.y += rowHeight * optionIndex;
            this.panels.splice(insertPos + i, 0, cloneRowPanel);
          }
        });
        rowCopy.panels = [];
        rowCopy.gridPos.y += rowHeight * optionIndex;
        yPos += rowHeight;
        panelBelowIndex = insertPos + rowPanels.length;
      }

      // Update gridPos for panels below
      for (let i = panelBelowIndex; i < this.panels.length; i++) {
        this.panels[i].gridPos.y += yPos;
      }
    }
  }
  
  getRowRepeatClone(sourceRowPanel: PanelModel, valueIndex: number, sourcePanelIndex: number) {
    // if first clone return source
    if (valueIndex === 0) {
      if (!sourceRowPanel.collapsed) {
        const rowPanels = this.getRowPanels(sourcePanelIndex);
        sourceRowPanel.panels = rowPanels;
      }
      return sourceRowPanel;
    }

    const clone = new PanelModel(sourceRowPanel.getSaveModel());
    // for row clones we need to figure out panels under row to clone and where to insert clone
    let rowPanels: PanelModel[], insertPos: number;
    if (sourceRowPanel.collapsed) {
      rowPanels = _.cloneDeep(sourceRowPanel.panels);
      clone.panels = rowPanels;
      // insert copied row after preceding row
      insertPos = sourcePanelIndex + valueIndex;
    } else {
      rowPanels = this.getRowPanels(sourcePanelIndex);
      clone.panels = _.map(rowPanels, (panel: PanelModel) => panel.getSaveModel());
      // insert copied row after preceding row's panels
      insertPos = sourcePanelIndex + (rowPanels.length + 1) * valueIndex;
    }
    this.panels.splice(insertPos, 0, clone);

    this.updateRepeatedPanelIds(clone);
    return clone;
  }
  getRowHeight(rowPanel: PanelModel): number {
    if (!rowPanel.panels || rowPanel.panels.length === 0) {
      return 0;
    }
    const rowYPos = rowPanel.gridPos.y;
    const positions = _.map(rowPanel.panels, 'gridPos');
    const maxPos = _.maxBy(positions, (pos: GridPos) => {
      return pos.y + pos.h;
    });
    return maxPos.y + maxPos.h - rowYPos;
  }
  
  getRowPanels(rowIndex: number): PanelModel[] {
    const rowPanels = [];

    for (let index = rowIndex + 1; index < this.panels.length; index++) {
      const panel = this.panels[index];

      // break when encountering another row
      if (panel.type === 'row') {
        break;
      }

      // this panel must belong to row
      rowPanels.push(panel);
    }

    return rowPanels;
  }
  
  updateRepeatedPanelIds(panel: PanelModel, repeatedByRow?: boolean) {
    panel.repeatPanelId = panel.id;
    panel.id = this.getNextPanelId();
    panel.repeatIteration = this.iteration;
    if (repeatedByRow) {
      panel.repeatedByRow = true;
    } else {
      panel.repeat = null;
    }
    return panel;
  }

    // cleans meta data and other non persistent state
    getSaveModelClone(options?: CloneOptions): DashboardModel {
      const defaults = _.defaults(options || {}, {
        saveVariables: true
      });
  
      // make clone
      let copy: any = {};
      for (const property in this) {
        if (DashboardModel.nonPersistedProperties[property] || !this.hasOwnProperty(property)) {
          continue;
        }
  
        copy[property] = _.cloneDeep(this[property]);
      }
  
      this.updateTemplatingSaveModelClone(copy, defaults);
      
      // get panel save models
      copy.panels = this.panels
        .filter((panel: PanelModel) => panel.type !== 'add-panel')
        .map((panel: PanelModel) => {
          // If we save while editing we should include the panel in edit mode instead of the
          // unmodified source panel
          if (this.panelInEdit && this.panelInEdit.editSourceId === panel.id) {
            const saveModel = this.panelInEdit.getSaveModel();
            // while editing a panel we modify its id, need to restore it here
            saveModel.id = this.panelInEdit.editSourceId;
            return saveModel;
          }
  
          return panel.getSaveModel();
        });
  
      //  sort by keys
      copy = sortByKeys(copy);
      copy.getVariables = () => {
        return copy.templating.list;
      };
  
      return copy;
    }
    
    hasVariableValuesChanged() {
      if (config.featureToggles.newVariables) {
        return this.hasVariablesChanged(this.originalTemplating, this.getVariablesFromState());
      }
  
      return this.hasVariablesChanged(this.originalTemplating, this.templating.list);
    }

    resetOriginalVariables(initial = false) {
      if (!config.featureToggles.newVariables || initial) {
        this.originalTemplating = this.cloneVariablesFrom(this.templating.list);
        return;
      }
  
      this.originalTemplating = this.cloneVariablesFrom(this.getVariablesFromState());
    }

    getVariables = () => {
      if (config.featureToggles.newVariables) {
        return this.getVariablesFromState();
      }
      return this.templating.list;
    };

    templateVariableValueUpdated() {
      this.processRepeats();
      this.events.emit(CoreEvents.templateVariableValueUpdated);
    }

    processRepeats() {
      if (!this.hasVariables()) {
        return;
      }
  
      this.cleanUpRepeats();
  
      this.iteration = (this.iteration || new Date().getTime()) + 1;
  
      for (let i = 0; i < this.panels.length; i++) {
        const panel = this.panels[i];
        if (panel.repeat) {
          this.repeatPanel(panel, i);
        }
      }
  
      this.sortPanelsByGridPos();
      this.events.emit(CoreEvents.repeatsProcessed);
    }

    cleanUpRepeats() {
      if ( !this.hasVariables()) {
        return;
      }
  
      this.iteration = (this.iteration || new Date().getTime()) + 1;
      const panelsToRemove = [];
  
      // cleanup scopedVars
      for (const panel of this.panels) {
        delete panel.scopedVars;
      }
  
      for (let i = 0; i < this.panels.length; i++) {
        const panel = this.panels[i];
        if ((!panel.repeat || panel.repeatedByRow) && panel.repeatPanelId && panel.repeatIteration !== this.iteration) {
          panelsToRemove.push(panel);
        }
      }
  
      // remove panels
      _.pull(this.panels, ...panelsToRemove);
      panelsToRemove.map(p => p.destroy());
      this.sortPanelsByGridPos();
      this.events.emit(CoreEvents.repeatsProcessed);
    }

    destroy() {
      this.events.removeAllListeners();
      for (const panel of this.panels) {
        panel.destroy();
      }
    }

    initViewPanel(panel: PanelModel) {
      this.panelInView = panel;
      panel.setIsViewing(true);
    }

    exitViewPanel(panel: PanelModel) {
      this.panelInView = undefined;
      panel.setIsViewing(false);
    }
    
    render() {
      this.events.emit(PanelEvents.render);
  
      for (const panel of this.panels) {
        panel.render();
      }
    }
    

    shouldUpdateDashboardPanelFromJSON(updatedPanel: PanelModel, panel: PanelModel) {
      const shouldUpdateGridPositionLayout = !isEqual(updatedPanel?.gridPos, panel?.gridPos);
      if (shouldUpdateGridPositionLayout) {
        // this.events.publish(new DashboardPanelsChangedEvent());
      }
    }

    
    private hasVariables() {
      if (config.featureToggles.newVariables) {
        return this.getVariablesFromState().length > 0;
      }
      return this.templating.list.length > 0;
    }

    private cloneVariablesFrom(variables: any[]): any[] {
      return variables.map(variable => {
        return {
          name: variable.name,
          type: variable.type,
          current: _.cloneDeep(variable.current),
          filters: _.cloneDeep(variable.filters),
        };
      });
    }
    
    private hasVariablesChanged(originalVariables: any[], currentVariables: any[]): boolean {
      if (originalVariables.length !== currentVariables.length) {
        return false;
      }
  
      const updated = _.map(currentVariables, (variable: any) => {
        return {
          name: variable.name,
          type: variable.type,
          current: _.cloneDeep(variable.current),
          filters: _.cloneDeep(variable.filters),
        };
      });
  
      return !_.isEqual(updated, originalVariables);
    }

    private updateTemplatingSaveModelClone(
      copy: any,
      defaults: { saveVariables: boolean } & CloneOptions
    ) {
      if (config.featureToggles.newVariables) {
        this.updateTemplatingSaveModel(copy, defaults);
        return;
      }
    }

    private updateTemplatingSaveModel(
      copy: any,
      defaults: { saveVariables: boolean } & CloneOptions
    ) {
      const originalVariables = this.originalTemplating;
      let currentVariables = this.getVariablesFromState();

      currentVariables = currentVariables.filter(variable => {
        // common dashboards cant save global variables
        if (this.uid !== GlobalVariableUid) {
          if (variable.global) {
            return false
          }
        }
        return true
      })

      copy.templating = {
        list: currentVariables.map(variable => {
          const model = variableAdapters.get(variable.type).getSaveModel(variable)
          if (this.uid === GlobalVariableUid) {
            model.global = true
          }
          return  model
        }),
      };
    
      if (!defaults.saveVariables) {
        for (let i = 0; i < copy.templating.list.length; i++) {
          const current = copy.templating.list[i];
          const original: any = _.find(originalVariables, { name: current.name, type: current.type });
  
          if (!original) {
            continue;
          }
  
          if (current.type === 'adhoc') {
            copy.templating.list[i].filters = original.filters;
          } else {
            copy.templating.list[i].current = original.current;
          }
        }
      }
    }

  private ensureListExist(data: any) {
    if (!data) {
      data = {};
    }
    if (!data.list) {
      data.list = [];
    }
    return data;
  }

  private getPanelRepeatVariable(panel: PanelModel) {
    if (!config.featureToggles.newVariables) {
      return _.find(this.templating.list, { name: panel.repeat } as any);
    }

    return this.getVariablesFromState().find(variable => variable.name === panel.repeat);
  }
}

