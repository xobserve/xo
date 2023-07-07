import * as React from 'react';
import { TExposedGraphState, TSvgLayersGroup } from './types';
type TProps<T = {}, U = {}> = Omit<TSvgLayersGroup<T, U>, 'layerType' | 'key'> & {
    getClassName: (name: string) => string;
    graphState: TExposedGraphState<T, U>;
};
export default class SvgLayersGroup<T = {}, U = {}> extends React.PureComponent<TProps<T, U>> {
    private renderLayers;
    render(): JSX.Element;
}
export {};
