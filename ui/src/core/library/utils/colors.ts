import { getBootConfig } from "src/packages/datav-core/src";

export function getThemeColor(dark: string, light: string): string {
  return getBootConfig().theme.isLight ? light : dark;
}
