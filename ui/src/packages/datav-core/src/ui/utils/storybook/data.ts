import { applyFieldOverrides, DataFrame, GrafanaTheme2 } from 'src/packages/datav-core/src/data';

export function prepDataForStorybook(data: DataFrame[], theme: GrafanaTheme2) {
  return applyFieldOverrides({
    data: data,
    fieldConfig: {
      overrides: [],
      defaults: {},
    },
    theme,
    replaceVariables: (value: string) => value,
  });
}
