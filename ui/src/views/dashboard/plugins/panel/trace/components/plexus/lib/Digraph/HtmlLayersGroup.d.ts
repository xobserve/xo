import * as React from 'react';
import { TExposedGraphState, THtmlLayersGroup } from './types';
import { TSizeVertex } from '../types';
type TProps<T = {}, U = {}> = Omit<THtmlLayersGroup<T, U>, 'layerType' | 'key'> & {
    getClassName: (name: string) => string;
    graphState: TExposedGraphState<T, U>;
    setSizeVertices: (senderKey: string, sizeVertices: TSizeVertex<T>[]) => void;
};
export default class HtmlLayersGroup<T = {}, U = {}> extends React.PureComponent<TProps<T, U>> {
    private renderLayers;
    render(): JSX.Element;
}
export {};
