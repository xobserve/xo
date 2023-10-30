CREATE TABLE IF NOT EXISTS signoz_traces.dependency_graph_minutes_v2 ON CLUSTER cluster (
    src LowCardinality(String) CODEC(ZSTD(1)),
    dest LowCardinality(String) CODEC(ZSTD(1)),
    duration_quantiles_state AggregateFunction(quantiles(0.5, 0.75, 0.9, 0.95, 0.99), Float64) CODEC(Default),
    error_count SimpleAggregateFunction(sum, UInt64) CODEC(T64, ZSTD(1)),
    total_count SimpleAggregateFunction(sum, UInt64) CODEC(T64, ZSTD(1)),
    timestamp DateTime CODEC(DoubleDelta, LZ4),
    environment LowCardinality(String) CODEC(ZSTD(1)),
    cluster LowCardinality(String) CODEC(ZSTD(1)),
    namespace LowCardinality(String) CODEC(ZSTD(1)),
) ENGINE AggregatingMergeTree
PARTITION BY toDate(timestamp)
ORDER BY (timestamp, src, dest, environment, cluster, namespace)
TTL toDateTime(timestamp) + INTERVAL 1296000 SECOND DELETE;


CREATE MATERIALIZED VIEW IF NOT EXISTS signoz_traces.dependency_graph_minutes_service_calls_mv_v2 ON CLUSTER cluster
TO signoz_traces.dependency_graph_minutes_v2 AS
SELECT
    A.serviceName as src,
    B.serviceName as dest,
    quantilesState(0.5, 0.75, 0.9, 0.95, 0.99)(toFloat64(B.duration)) as duration_quantiles_state,
    countIf(B.statusCode=2) as error_count,
    count(*) as total_count,
    toStartOfMinute(fromUnixTimestamp64Nano(B.startTime)) as timestamp,
    B.resourcesMap['environment'] as environment,
    B.resourcesMap['cluster'] as cluster,
    B.resourcesMap['namespace'] as namespace
FROM signoz_traces.signoz_index_v2 AS A, signoz_traces.signoz_index_v2 AS B
WHERE (A.serviceName != B.serviceName) AND (A.spanId = B.parentId)
GROUP BY timestamp, src, dest, environment, cluster, namespace;

CREATE MATERIALIZED VIEW IF NOT EXISTS signoz_traces.dependency_graph_minutes_db_calls_mv_v2 ON CLUSTER cluster
TO signoz_traces.dependency_graph_minutes_v2 AS
SELECT
    serviceName as src,
    attributesMap['db.system'] as dest,
    quantilesState(0.5, 0.75, 0.9, 0.95, 0.99)(toFloat64(duration)) as duration_quantiles_state,
    countIf(statusCode=2) as error_count,
    count(*) as total_count,
    toStartOfMinute(fromUnixTimestamp64Nano(startTime)) as timestamp,
    resourcesMap['environment'] as environment,
    resourcesMap['cluster'] as cluster,
    resourcesMap['namespace'] as namespace
FROM signoz_traces.signoz_index_v2
WHERE dest != '' and kind != 2
GROUP BY timestamp, src, dest,  environment, cluster, namespace;

CREATE MATERIALIZED VIEW IF NOT EXISTS signoz_traces.dependency_graph_minutes_messaging_calls_mv_v2 ON CLUSTER cluster
TO signoz_traces.dependency_graph_minutes_v2 AS
SELECT
    serviceName as src,
    attributesMap['messaging.system'] as dest,
    quantilesState(0.5, 0.75, 0.9, 0.95, 0.99)(toFloat64(duration)) as duration_quantiles_state,
    countIf(statusCode=2) as error_count,
    count(*) as total_count,
    toStartOfMinute(fromUnixTimestamp64Nano(startTime)) as timestamp,
    resourcesMap['environment'] as environment,
    resourcesMap['cluster'] as cluster,
    resourcesMap['namespace'] as namespace
FROM signoz_traces.signoz_index_v2
WHERE dest != '' and kind != 2
GROUP BY timestamp, src, dest,  environment, cluster, namespace;

CREATE TABLE IF NOT EXISTS signoz_traces.distributed_dependency_graph_minutes_v2 ON CLUSTER cluster AS signoz_traces.dependency_graph_minutes_v2
ENGINE = Distributed("cluster", "signoz_traces", dependency_graph_minutes_v2, cityHash64(rand()));