import darkTheme from './dark';
import lightTheme from './light';
import { DatavTheme,ThemeType} from '../../data';

let themeMock: ((name?: string) => DatavTheme) | null;

export const getTheme = (name?: string) => {
  return (themeMock && themeMock(name)) || (name === 'light' ? lightTheme : darkTheme);
}

export const mockTheme = (mock: (name?: string) => DatavTheme) => {
  themeMock = mock;
  return () => {
    themeMock = null;
  };
};
