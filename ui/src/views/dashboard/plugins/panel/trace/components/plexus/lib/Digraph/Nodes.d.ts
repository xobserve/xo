import * as React from 'react';
import { TLayerType, TNodeRenderer, TRendererUtils } from './types';
import { TLayoutVertex } from '../types';
type TProps<T = {}> = TNodeRenderer<T> & {
    getClassName: (name: string) => string;
    layerType: TLayerType;
    layoutVertices: TLayoutVertex<T>[];
    renderNode: NonNullable<TNodeRenderer<T>['renderNode']>;
    renderUtils: TRendererUtils;
};
export default class Nodes<T = {}> extends React.Component<TProps<T>> {
    shouldComponentUpdate(np: TProps<T>): boolean;
    render(): JSX.Element[];
}
export {};
