import { concat } from "lodash";

const colorThemeExcludes = ['current','black','white','whiteAlpha', 'blackAlpha'];
export const getColorThemeValues = (theme, excludes?: string[]) => {
    return Object.keys(theme.colors).filter(c => !(concat(colorThemeExcludes, excludes)).includes(c))
}