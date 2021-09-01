import { GrafanaTheme } from 'src/packages/datav-core/src';
import {selectThemeVariant} from 'src/packages/datav-core/src/ui'
export const getThemeColors = (theme: GrafanaTheme) => {
  return {
    border: theme.colors.border1,
    background: theme.colors.bodyBg,
    shadow: theme.colors.dropdownShadow,
    formBackground: selectThemeVariant(
      {
        dark: theme.palette.gray15,
        light: theme.palette.gray98,
      },
      theme.type
    ),
  };
};
