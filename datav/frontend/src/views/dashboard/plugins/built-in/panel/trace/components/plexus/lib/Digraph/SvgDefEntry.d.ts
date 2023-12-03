import * as React from 'react';
import { TFromGraphStateFn, TAnyProps, TSetProps, TExposedGraphState } from './types';
type TProps<T = {}, U = {}> = {
    getClassName: (name: string) => string;
    graphState: TExposedGraphState<T, U>;
    localId: string;
    renderEntry?: (graphState: TExposedGraphState<T, U>, entryProps: TAnyProps | null, id: string) => React.ReactElement;
    setOnEntry?: TSetProps<TFromGraphStateFn<T, U>>;
};
export default class SvgDefEntry<T = {}, U = {}> extends React.PureComponent<TProps<T, U>> {
    render(): JSX.Element;
}
export {};
