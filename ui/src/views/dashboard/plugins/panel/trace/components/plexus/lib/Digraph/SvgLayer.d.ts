import * as React from 'react';
import { TSetOnContainer, TExposedGraphState, TDefEntry } from './types';
import TNonEmptyArray from '../types/TNonEmptyArray';
type TProps<T = {}, U = {}> = Record<string, unknown> & TSetOnContainer<T, U> & {
    classNamePart: string;
    getClassName: (name: string) => string;
    defs?: TNonEmptyArray<TDefEntry<T, U>>;
    extraWrapper?: Record<string, unknown>;
    graphState: TExposedGraphState<T, U>;
    standalone?: boolean;
    topLayer?: boolean;
};
export default class SvgLayer<T = {}, U = {}> extends React.PureComponent<TProps<T, U>> {
    render(): JSX.Element;
}
export {};
