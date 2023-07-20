const colorThemeExcludes = ['current','black','white','whiteAlpha', 'blackAlpha'];
export const getColorThemeValues = (theme) => {
    return Object.keys(theme.colors).filter(c => !colorThemeExcludes.includes(c))
}