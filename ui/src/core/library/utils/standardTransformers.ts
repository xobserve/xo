import { TransformerRegistyItem } from 'src/packages/datav-core';
import { reduceTransformRegistryItem } from 'src/views/components/TransformersUI/ReduceTransformerEditor';
import { filterFieldsByNameTransformRegistryItem } from 'src/views/components/TransformersUI/FilterByNameTransformerEditor';
import { filterFramesByRefIdTransformRegistryItem } from 'src/views/components/TransformersUI/FilterByRefIdTransformerEditor';
import { organizeFieldsTransformRegistryItem } from 'src/views/components/TransformersUI/OrganizeFieldsTransformerEditor';
import { seriesToFieldsTransformerRegistryItem } from 'src/views/components/TransformersUI/SeriesToFieldsTransformerEditor';
import { calculateFieldTransformRegistryItem } from 'src/views/components/TransformersUI/CalculateFieldTransformerEditor';
import { labelsToFieldsTransformerRegistryItem } from 'src/views/components/TransformersUI/LabelsToFieldsTransformerEditor';
 
export const getStandardTransformers = (): Array<TransformerRegistyItem<any>> => {
  return [
    reduceTransformRegistryItem,
    filterFieldsByNameTransformRegistryItem,
    filterFramesByRefIdTransformRegistryItem,
    organizeFieldsTransformRegistryItem,
    seriesToFieldsTransformerRegistryItem,
    calculateFieldTransformRegistryItem,
    labelsToFieldsTransformerRegistryItem,
  ];
};
