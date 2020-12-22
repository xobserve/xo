import { ThemeType } from '../../data';

type VariantDescriptor = { [key in ThemeType]: string | number };

export const selectThemeVariant = (variants: VariantDescriptor, currentTheme?: ThemeType) => {
  return variants[currentTheme || ThemeType.Dark];
};
