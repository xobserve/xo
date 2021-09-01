import { createTheme, GrafanaTheme } from '../../data';

let themeMock: ((name?: string) => GrafanaTheme) | null;

/** @public */
export const getTheme = (mode: 'dark' | 'light' = 'dark') => {
  if (themeMock) {
    alert(1)
    return themeMock(mode);
  }

  return createTheme({ colors: { mode } }).v1;
};

export const getTheme2 = (mode: 'dark' | 'light' = 'dark') => {
  return createTheme({ colors: { mode } });
};

/** @public */
export const mockTheme = (mock: (name?: string) => GrafanaTheme) => {
  themeMock = mock;
  return () => {
    themeMock = null;
  };
};
