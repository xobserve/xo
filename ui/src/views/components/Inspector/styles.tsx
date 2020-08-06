import { css } from 'emotion';
import { stylesFactory, getTheme, currentTheme } from 'src/packages/datav-core';


export const getPanelInspectorStyles = stylesFactory(() => {
  const theme = getTheme(currentTheme)
  console.log('inspector theme, 可能存在不生效或者主题切换无效的bug:',theme)

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
      margin-bottom: ${theme.spacing.sm};
    `,
    toolbarItem: css`
      margin-left: ${theme.spacing.md};
    `,
    content: css`
      flex-grow: 1;
      padding-bottom: 16px;
    `,
    contentQueryInspector: css`
      flex-grow: 1;
      padding: ${theme.spacing.md} 0;
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
      flex-wrap: wrap;
    `,
    leftActions: css`
      display: flex;
      flex-grow: 1;
    `,
    options: css`
      margin-top: 19px;
    `,
    dataDisplayOptions: css`
      flex-grow: 1;
      min-width: 300px;
      margin-right: ${theme.spacing.sm};
    `,
    selects: css`
      display: flex;
      > * {
        margin-right: ${theme.spacing.sm};
      }
    `,
  };
});
