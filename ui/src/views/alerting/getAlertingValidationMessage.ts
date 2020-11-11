import { DataQuery,DataSourceService,DataTransformerConfig} from 'src/packages/datav-core/src';
import alertDef from './state/alertDef';



export const getDefaultCondition = () => ({
  type: 'query',
  query: {
    refId: 'A',
    lastFor: '5m'
  },
  reducer: 'avg',
  evaluator: { type: 'gt', params: [{labelName: alertDef.defaultEvaluatorParamLabel,labelValue:alertDef.defaultEvaluatorParamLabel,value: [0.2,1]}] as any[] },
  operator: 'and',
});

export const getAlertingValidationMessage = async (
  transformations: DataTransformerConfig[],
  targets: DataQuery[],
  datasourceSrv: DataSourceService,
  datasourceName: string
): Promise<string> => {
  if (targets.length === 0) {
    return 'Could not find any metric queries';
  }

  if (transformations && transformations.length) {
    return 'Transformations are not supported in alert queries';
  }

  let alertingNotSupported = 0;
  let templateVariablesNotSupported = 0;

  for (const target of targets) {
    const dsName = target.datasource || datasourceName;
    const ds = await datasourceSrv.get(dsName);
    if (!ds.meta.alerting) {
      alertingNotSupported++;
    } else if (ds.targetContainsTemplate && ds.targetContainsTemplate(target)) {
      templateVariablesNotSupported++;
    }
  }

  if (alertingNotSupported === targets.length) {
    return 'The datasource does not support alerting queries';
  }

  if (templateVariablesNotSupported === targets.length) {
    return 'Template variables are not supported in alert queries';
  }

  return '';
};
