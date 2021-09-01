import { Registry } from 'src/packages/datav-core/src';
import { getBasicValueMatchersUI } from './BasicMatcherEditor';
import { getNoopValueMatchersUI } from './NoopMatcherEditor';
import { getRangeValueMatchersUI } from './RangeMatcherEditor';
import { ValueMatcherUIRegistryItem } from './types';

export const valueMatchersUI = new Registry<ValueMatcherUIRegistryItem<any>>(() => {
  return [...getBasicValueMatchersUI(), ...getNoopValueMatchersUI(), ...getRangeValueMatchersUI()];
});
