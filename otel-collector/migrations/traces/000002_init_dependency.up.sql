CREATE TABLE IF NOT EXISTS xobserve_traces.dependency_graph_minutes ON CLUSTER cluster (
    src LowCardinality(String) CODEC(ZSTD(1)),
    dest LowCardinality(String) CODEC(ZSTD(1)),
    operation LowCardinality(String) CODEC(ZSTD(1)),
    duration_quantiles_state AggregateFunction(quantiles(0.5, 0.75, 0.9, 0.95, 0.99), Float64) CODEC(Default),
    error_count SimpleAggregateFunction(sum, UInt64) CODEC(T64, ZSTD(1)),
    total_count SimpleAggregateFunction(sum, UInt64) CODEC(T64, ZSTD(1)),
    timestamp DateTime CODEC(DoubleDelta, LZ4),
    teamId LowCardinality(String) CODEC(ZSTD(1)), 
    cluster LowCardinality(String) CODEC(ZSTD(1)),
    namespace LowCardinality(String) CODEC(ZSTD(1)),
    INDEX idx_cluster cluster TYPE bloom_filter GRANULARITY 4,
    INDEX idx_namespace namespace TYPE bloom_filter GRANULARITY 4,
) ENGINE AggregatingMergeTree
PARTITION BY toDate(timestamp)
ORDER BY (timestamp,teamId, src, dest, operation)
TTL toDateTime(timestamp) + INTERVAL 1296000 SECOND DELETE;


CREATE MATERIALIZED VIEW IF NOT EXISTS xobserve_traces.dependency_graph_minutes_service_calls_mv ON CLUSTER cluster
TO xobserve_traces.dependency_graph_minutes AS
SELECT
    A.serviceName as src,
    B.serviceName as dest,
    B.name as operation,
    quantilesState(0.5, 0.75, 0.9, 0.95, 0.99)(toFloat64(B.duration)) as duration_quantiles_state,
    countIf(B.statusCode=2) as error_count,
    count(*) as total_count,
    toStartOfMinute(fromUnixTimestamp64Nano(B.startTime)) as timestamp,
    B.teamId as teamId,
    B.cluster as cluster,
    B.namespace as namespace
FROM xobserve_traces.trace_index AS A, xobserve_traces.trace_index AS B
WHERE (A.serviceName != B.serviceName) AND (A.spanId = B.parentId)
GROUP BY timestamp,teamId, cluster, namespace, src, dest, operation;

CREATE MATERIALIZED VIEW IF NOT EXISTS xobserve_traces.dependency_graph_minutes_db_calls_mv ON CLUSTER cluster
TO xobserve_traces.dependency_graph_minutes AS
SELECT
    serviceName as src,
    attributesMap['db.system'] as dest,
    attributesMap['db.statement'] as operation,
    quantilesState(0.5, 0.75, 0.9, 0.95, 0.99)(toFloat64(duration)) as duration_quantiles_state,
    countIf(statusCode=2) as error_count,
    count(*) as total_count,
    toStartOfMinute(fromUnixTimestamp64Nano(startTime)) as timestamp,
    teamId,
    cluster,
    namespace
FROM xobserve_traces.trace_index
WHERE dest != '' and kind != 2
GROUP BY timestamp,teamId, cluster, namespace, src, dest, operation;

CREATE MATERIALIZED VIEW IF NOT EXISTS xobserve_traces.dependency_graph_minutes_messaging_calls_mv ON CLUSTER cluster
TO xobserve_traces.dependency_graph_minutes AS
SELECT
    serviceName as src,
    attributesMap['messaging.system'] as dest,
    attributesMap['messaging.destination.name'] as operation,
    quantilesState(0.5, 0.75, 0.9, 0.95, 0.99)(toFloat64(duration)) as duration_quantiles_state,
    countIf(statusCode=2) as error_count,
    count(*) as total_count,
    toStartOfMinute(fromUnixTimestamp64Nano(startTime)) as timestamp,
    teamId,
    cluster,
    namespace
FROM xobserve_traces.trace_index
WHERE dest != '' and kind != 2
GROUP BY timestamp,teamId, cluster, namespace, src, dest, operation;

CREATE TABLE IF NOT EXISTS xobserve_traces.distributed_dependency_graph_minutes ON CLUSTER cluster AS xobserve_traces.dependency_graph_minutes
ENGINE = Distributed("cluster", "xobserve_traces", dependency_graph_minutes, cityHash64(rand()));