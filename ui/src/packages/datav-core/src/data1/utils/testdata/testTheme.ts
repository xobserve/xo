import { GrafanaTheme, ThemeType } from '../../types/theme';

export function getTestTheme(type: ThemeType = ThemeType.Dark): GrafanaTheme {
  return ({
    type,
    isDark: type === ThemeType.Dark,
    isLight: type === ThemeType.Light,
    colors: {
      panelBg: 'white',
    },
  } as unknown) as GrafanaTheme;
} 
