import { TPropsFactoryFn } from '../types';
export declare function assignMergeCss(...objs: Record<string, any>[]): Record<string, any>;
export default function mergePropSetters<U>(...fns: TPropsFactoryFn<U>[]): TPropsFactoryFn<U>;
