import _, { map, flattenDeep, has, groupBy, values, reduce, merge, forOwn, keys } from 'lodash';
import Utils from '../utils';
import {DependencyGraph}  from '../DependencyGraph';
import { QueryResponse, GraphDataElement, GraphDataType, CurrentData } from '../types';

class PreProcessor {

	controller: DependencyGraph;

	constructor(controller: DependencyGraph) {
		this.controller = controller;
	}

	_transformTable(table: QueryResponse) {
		const objectTable = map(table.rows, row => {
			const rowObject: any = {};

			for (var i = 0; i < row.length; i++) {
				if (row[i] !== "") {
					const key = table.columns[i].text;
					rowObject[key] = row[i];
				}
			}

			return rowObject;
		});
		return objectTable;
	}

	_transformTables(tables: QueryResponse[]) {
		const result = map(tables, table => this._transformTable(table));
		return result;
	}

	_transformObjects(data: any[]): GraphDataElement[] {
		const { extOrigin: externalSource, extTarget: externalTarget, sourceComponentPrefix, targetComponentPrefix } = this.controller.props.options.dataMapping;
		const aggregationSuffix: string = Utils.getTemplateVariable(this.controller, 'aggregationType');

		const sourceColumn = sourceComponentPrefix + aggregationSuffix;
		const targetColumn = targetComponentPrefix + aggregationSuffix;

		const result = map(data, dataObject => {
			let source = has(dataObject, sourceColumn);
			let target = has(dataObject, targetColumn);
			const extSource = has(dataObject, externalSource);
			const extTarget = has(dataObject, externalTarget);

			let trueCount = [source, target, extSource, extTarget].filter(e => e).length;

			if (trueCount > 1) {
				if (target && extTarget) {
					target = false;
				} else if (source && extSource) {
					source = false;
				} else {
					console.error("soruce-target conflict for data element", dataObject);
					return;
				}
			}

			const result: GraphDataElement = {
				target: "",
				data: dataObject,
				type: GraphDataType.INTERNAL
			};

			if (trueCount == 0) {
				result.target = dataObject[aggregationSuffix];
				result.type = GraphDataType.EXTERNAL_IN;
			} else {
				if (source || target) {
					if (source) {
						result.source = dataObject[sourceColumn];
						result.target = dataObject[aggregationSuffix];
					} else {
						result.source = dataObject[aggregationSuffix];
						result.target = dataObject[targetColumn];
					}

					if (result.source === result.target) {
						result.type = GraphDataType.SELF;
					}
				} else if (extSource) {
					result.source = dataObject[externalSource];
					result.target = dataObject[aggregationSuffix];
					result.type = GraphDataType.EXTERNAL_IN;
				} else if (extTarget) {
					result.source = dataObject[aggregationSuffix];
					result.target = dataObject[externalTarget];
					result.type = GraphDataType.EXTERNAL_OUT;
				}
			}
			return result;
		});

		const filteredResult: GraphDataElement[] = result.filter((element): element is GraphDataElement => element !== null);
		return filteredResult;
	}

	_mergeGraphData(data: GraphDataElement[]): GraphDataElement[] {
		const groupedData = values(groupBy(data, element => element.source + '<--->' + element.target));

		const mergedData = map(groupedData, group => {
			return reduce(group, (result, next) => {
				return merge(result, next);
			}, <GraphDataElement>{});
		});

		return mergedData;
	}

	_cleanMetaData(columnMapping: any, metaData: any) {
		const result = {};

		forOwn(columnMapping, (value, key) => {
			if (has(metaData, value)) {
				result[key] = metaData[value];
			}
		});

		return result;
	}

	_cleanData(data: GraphDataElement[]): GraphDataElement[] {
		const columnMapping = {};
		columnMapping['response_time_in'] = Utils.getConfig(this.controller, 'responseTimeColumn');
		columnMapping['rate_in'] = Utils.getConfig(this.controller, 'requestRateColumn');
		columnMapping['error_rate_in'] = Utils.getConfig(this.controller, 'errorRateColumn');
		columnMapping['response_time_out'] = Utils.getConfig(this.controller, 'responseTimeOutgoingColumn');
		columnMapping['rate_out'] = Utils.getConfig(this.controller, 'requestRateOutgoingColumn');
		columnMapping['error_rate_out'] = Utils.getConfig(this.controller, 'errorRateOutgoingColumn');
		columnMapping['type'] = Utils.getConfig(this.controller, 'type');
		columnMapping["threshold"] = Utils.getConfig(this.controller, 'baselineRtUpper');

		const cleanedData = map(data, dataElement => {
			const cleanedMetaData = this._cleanMetaData(columnMapping, dataElement.data);

			const result = {
				...dataElement,
				data: cleanedMetaData
			};

			return result;
		});

		return cleanedData;
	}

	_extractColumnNames(data: GraphDataElement[]): string[] {
		const columnNames: string[] = _(data)
			.flatMap(dataElement => keys(dataElement.data))
			.uniq()
			.sort()
			.value();

		return columnNames;
	}

	processData(inputData: QueryResponse[]): CurrentData {
		const objectTables = this._transformTables(inputData);

		const flattenData = flattenDeep(objectTables);

		const graphElements = this._transformObjects(flattenData);

		const mergedData = this._mergeGraphData(graphElements);
		const columnNames = this._extractColumnNames(mergedData);

		const cleanData = this._cleanData(mergedData);

		console.groupCollapsed('Data transformation log');
		console.log('Transform tables:', objectTables);
		console.log('Flat data:', flattenData);
		console.log('Graph elements:', graphElements);
		console.log('Merged graph data:', mergedData);
		console.log('Cleaned data:', cleanData);
		console.log('Table columns:', columnNames);
		console.groupEnd();

		return {
			graph: cleanData,
			raw: inputData,
			columnNames: columnNames
		};
	}
};

export default PreProcessor;
