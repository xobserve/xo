import { DatavTheme ,selectThemeVariant} from 'src/packages/datav-core/src';

export const getThemeColors = (theme: DatavTheme) => {
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
