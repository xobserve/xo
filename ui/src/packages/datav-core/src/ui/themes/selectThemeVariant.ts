import { ThemeType } from '../../data';

/**
 * @deprecated
 */
export type VariantDescriptor = { [key in ThemeType]: string | number };

/**
 * @deprecated use theme.isLight ? or theme.isDark instead
 */
export const selectThemeVariant = (variants: VariantDescriptor, currentTheme?: ThemeType) => {
  return variants[currentTheme || ThemeType.Dark];
};
