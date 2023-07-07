import * as React from 'react';
import { TExposedGraphState, TStandaloneEdgesLayer } from './types';
type TProps<T = {}, U = {}> = Omit<TStandaloneEdgesLayer<T, U>, 'edges' | 'layerType' | 'key'> & {
    getClassName: (name: string) => string;
    graphState: TExposedGraphState<T, U>;
    standalone?: boolean;
};
export default class SvgEdgesLayer<T = {}, U = {}> extends React.PureComponent<TProps<T, U>> {
    render(): JSX.Element | null;
}
export {};
