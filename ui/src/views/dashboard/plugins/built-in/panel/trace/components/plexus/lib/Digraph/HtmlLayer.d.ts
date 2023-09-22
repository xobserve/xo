import * as React from 'react';
import { TSetOnContainer, TExposedGraphState } from './types';
type TProps<T = {}, U = {}> = Record<string, unknown> & TSetOnContainer<T, U> & {
    classNamePart: string;
    getClassName: (name: string) => string;
    graphState: TExposedGraphState<T, U>;
    standalone?: boolean;
    topLayer?: boolean;
};
export default class HtmlLayer<T = {}, U = {}> extends React.PureComponent<TProps<T, U>> {
    render(): JSX.Element;
}
export {};
