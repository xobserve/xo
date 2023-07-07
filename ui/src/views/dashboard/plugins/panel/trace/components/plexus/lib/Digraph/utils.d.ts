import { TPropFactoryFn, TSetProps } from './types';
export declare function assignMergeCss(...objs: Record<string, any>[]): Record<string, any>;
export declare function getProps<TFactoryFn extends TPropFactoryFn>(propSpec: TSetProps<TFactoryFn> | void, ...args: Parameters<TFactoryFn>): Record<string, any>;
export declare const getValueScaler: (config?: Partial<{
    expAdjuster: number;
    factorMax: number;
    factorMin: number;
    valueMax: number;
    valueMin: number;
}>) => (factor: number) => number;
export declare function isSamePropSetter(a: TSetProps<any>, b: TSetProps<any>): boolean;
