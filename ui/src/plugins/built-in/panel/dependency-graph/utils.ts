import _ from 'lodash';
import { DependencyGraph } from './DependencyGraph';

export function isPresent<T>(t: T | undefined | null | void): t is T {
	return t !== undefined && t !== null;
};

export default {

	getTemplateVariable: function (controller:DependencyGraph, variableName) {
		var templateVariable: any = _.find(controller.props.dashboard.templating.list, {
			name: variableName
		});
		if (templateVariable) {
			return templateVariable.current.value;
		} else {
			return undefined;
		}
	},

	getConfig: function (controller:DependencyGraph, configName) {
		return controller.props.options.dataMapping[configName];
	},

	getTemplateVariableValues: function (controller:DependencyGraph, variableName) {
		var templateVariable: any = _.find(controller.props.dashboard.templating.list, {
			name: variableName
		});
		var options: any = templateVariable.model.options;
		return _.map(options, o => o.value);
	}

};
