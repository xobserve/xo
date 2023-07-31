import { FeatureLike } from 'ol/Feature';


import { FeatureRuleConfig } from '../types';
import { compareValues } from './compareValues';

/**
 * Check whether feature has property value that matches rule
 * @param rule - style rule with an operation, property, and value
 * @param feature - feature with properties and values
 * @returns boolean
 */
export const checkFeatureMatchesStyleRule = (rule: FeatureRuleConfig, feature: FeatureLike) => {
  const val = feature.get(rule.property);
  return compareValues(val, rule.operation, rule.value);
};
