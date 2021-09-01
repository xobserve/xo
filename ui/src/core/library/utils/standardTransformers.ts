import { TransformerRegistryItem } from 'src/packages/datav-core/src';
import { reduceTransformRegistryItem } from 'src/views/components/TransformersUI/ReduceTransformerEditor';
import { filterFieldsByNameTransformRegistryItem } from 'src/views/components/TransformersUI/FilterByNameTransformerEditor';
import { filterFramesByRefIdTransformRegistryItem } from 'src/views/components/TransformersUI/FilterByRefIdTransformerEditor';
import { organizeFieldsTransformRegistryItem } from 'src/views/components/TransformersUI/OrganizeFieldsTransformerEditor';
import { seriesToFieldsTransformerRegistryItem } from 'src/views/components/TransformersUI/SeriesToFieldsTransformerEditor';
import { calculateFieldTransformRegistryItem } from 'src/views/components/TransformersUI/CalculateFieldTransformerEditor';
import { labelsToFieldsTransformerRegistryItem } from 'src/views/components/TransformersUI/LabelsToFieldsTransformerEditor';
import { groupByTransformRegistryItem } from 'src/views/components/TransformersUI/GroupByTransformerEditor';
import { mergeTransformerRegistryItem } from 'src/views/components/TransformersUI/MergeTransformerEditor';
import { seriesToRowsTransformerRegistryItem } from 'src/views/components/TransformersUI/SeriesToRowsTransformerEditor';
import { concatenateTransformRegistryItem } from 'src/views/components/TransformersUI/ConcatenateTransformerEditor';

export const getStandardTransformers = (): Array<TransformerRegistryItem<any>> => {
  return [
    reduceTransformRegistryItem,
    filterFieldsByNameTransformRegistryItem,
    filterFramesByRefIdTransformRegistryItem,
    organizeFieldsTransformRegistryItem,
    seriesToFieldsTransformerRegistryItem,
    seriesToRowsTransformerRegistryItem,
    concatenateTransformRegistryItem,
    calculateFieldTransformRegistryItem,
    labelsToFieldsTransformerRegistryItem,
    groupByTransformRegistryItem,
    mergeTransformerRegistryItem,
  ];
};
