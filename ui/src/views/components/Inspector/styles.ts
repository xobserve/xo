import { css } from 'emotion';
import { getTheme, stylesFactory } from 'src/packages/datav-core/src';

export const getPanelInspectorStyles = stylesFactory(() => {
  return {
    wrap: css`
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      flex: 1 1 0;
    `,
    toolbar: css`
      display: flex;
      width: 100%;
      flex-grow: 0;
      align-items: center;
      justify-content: flex-end;
      margin-bottom: ${getTheme().spacing.sm};
    `,
    toolbarItem: css`
      margin-left: ${getTheme().spacing.md};
    `,
    content: css`
      flex-grow: 1;
      padding-bottom: 16px;
    `,
    contentQueryInspector: css`
      flex-grow: 1;
      padding: ${getTheme().spacing.md} 0;
    `,
    editor: css`
      font-family: monospace;
      height: 100%;
      flex-grow: 1;
    `,
    viewer: css`
      overflow: scroll;
    `,
    dataFrameSelect: css`
      flex-grow: 2;
    `,
    tabContent: css`
      height: 100%;
      display: flex;
      flex-direction: column;
    `,
    dataTabContent: css`
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
    `,
    actionsWrapper: css`
      display: flex;
    `,
    leftActions: css`
      display: flex;
      flex-grow: 1;

      max-width: 85%;
      @media (max-width: 1345px) {
        max-width: 75%;
      }
    `,
    options: css`
      padding-top: ${getTheme().spacing.sm};
    `,
    dataDisplayOptions: css`
      flex-grow: 1;
      min-width: 300px;
      margin-right: ${getTheme().spacing.sm};
    `,
    selects: css`
      display: flex;
      > * {
        margin-right: ${getTheme().spacing.sm};
      }
    `,
  };
});
