import _, { map, flattenDeep, has, groupBy, values, reduce, merge, forOwn, keys } from 'lodash';
import Utils from '../utils';
import {DependencyGraph}  from '../DependencyGraph';
import { QueryResponse, GraphDataElement, GraphDataType, CurrentData, ExternalType } from '../types';

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
		const { source: sourceColumn, target: targetColumn ,externalType} = this.controller.props.options.dataMapping;


		const result = map(data, dataObject => {
			let hasSource = has(dataObject, sourceColumn);
			let hasTarget = has(dataObject, targetColumn);

			if (!hasSource || !hasTarget) {
				console.log("dependency-graph data has no source or target column")
				return 
			}

			const result: GraphDataElement = {
				source: dataObject[sourceColumn],
				target: dataObject[targetColumn],
				data: dataObject,
				externalType: dataObject[externalType]?? ExternalType.NoExternal
			};

			return result;
		});

		const filteredResult: GraphDataElement[] = result.filter((element): element is GraphDataElement => element !== null);
		return filteredResult;
	}

	_mergeGraphData(data: GraphDataElement[]): GraphDataElement[] {
		const groupedData = values(groupBy(data, element => element?.source + '<--->' + element?.target));

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
		columnMapping['responseTime'] = Utils.getConfig(this.controller, 'responseTimeColumn');
		columnMapping['requests'] = Utils.getConfig(this.controller, 'requestColumn');
		columnMapping['errors'] = Utils.getConfig(this.controller, 'errorsColumn');
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
