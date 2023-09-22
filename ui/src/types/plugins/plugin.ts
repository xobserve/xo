export interface PanelPluginComponents {
    panel: any,
    editor: any,
    overrideEditor: any,
    overrideRules: any,
    getOverrideTargets: (panel,data) => any
}