import * as React from 'react';
import { TExposedGraphState, TLayerType, TSetOnContainer, TNodeRenderer } from './types';
type TProps<T = {}, U = {}> = TNodeRenderer<T> & TSetOnContainer<T, U> & {
    getClassName: (name: string) => string;
    graphState: TExposedGraphState<T, U>;
    layerType: TLayerType;
    standalone?: boolean;
};
export default class NodesLayer<T = {}, U = {}> extends React.PureComponent<TProps<T, U>> {
    render(): JSX.Element | null;
}
export {};
