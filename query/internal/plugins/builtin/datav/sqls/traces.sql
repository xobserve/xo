CREATE TABLE signoz_traces.signoz_index_v2
(
    `startTime` UInt64 CODEC(DoubleDelta, LZ4),
    `duration` UInt64 CODEC(T64, ZSTD(1)),
    `traceId` FixedString(32) CODEC(ZSTD(1)),
    `spanId` String CODEC(ZSTD(1)),
    `parentId` String CODEC(ZSTD(1)),
     tenantId LowCardinality(String) CODEC(ZSTD(1)),
     environment LowCardinality(String) CODEC(ZSTD(1)),
    `serviceName` LowCardinality(String) CODEC(ZSTD(1)),
    `name` LowCardinality(String) CODEC(ZSTD(1)),
    `kind` Int8 CODEC(T64, ZSTD(1)),
  
    `statusCode` Int16 CODEC(T64, ZSTD(1)),
    `externalHttpMethod` LowCardinality(String) CODEC(ZSTD(1)),
    `externalHttpUrl` LowCardinality(String) CODEC(ZSTD(1)),
    `component` LowCardinality(String) CODEC(ZSTD(1)),
    `dbSystem` LowCardinality(String) CODEC(ZSTD(1)),
    `dbName` LowCardinality(String) CODEC(ZSTD(1)),
    `dbOperation` LowCardinality(String) CODEC(ZSTD(1)),
    `peerService` LowCardinality(String) CODEC(ZSTD(1)),
    `events` Array(String) CODEC(ZSTD(2)),
    `httpMethod` LowCardinality(String) CODEC(ZSTD(1)),
    `httpUrl` LowCardinality(String) CODEC(ZSTD(1)),
    `httpCode` LowCardinality(String) CODEC(ZSTD(1)),
    `httpRoute` LowCardinality(String) CODEC(ZSTD(1)),
    `httpHost` LowCardinality(String) CODEC(ZSTD(1)),
    `msgSystem` LowCardinality(String) CODEC(ZSTD(1)),
    `msgOperation` LowCardinality(String) CODEC(ZSTD(1)),
    `hasError` Bool CODEC(T64, ZSTD(1)),
    `gRPCMethod` LowCardinality(String) CODEC(ZSTD(1)),
    `gRPCCode` LowCardinality(String) CODEC(ZSTD(1)),
    `rpcSystem` LowCardinality(String) CODEC(ZSTD(1)),
    `rpcService` LowCardinality(String) CODEC(ZSTD(1)),
    `rpcMethod` LowCardinality(String) CODEC(ZSTD(1)),
    `attributesMap` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    `responseStatusCode` LowCardinality(String) CODEC(ZSTD(1)),
    `stringAttributesMap` Map(String, String) CODEC(ZSTD(1)),
    `numberAttributesMap` Map(String, Float64) CODEC(ZSTD(1)),
    `boolAttributesMap` Map(String, Bool) CODEC(ZSTD(1)),
    `resourcesMap` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    INDEX idx_traceId  traceId  TYPE bloom_filter(0.001) GRANULARITY 1,
    INDEX idx_parentId  parentId  TYPE bloom_filter(0.001) GRANULARITY 1,
    INDEX idx_name name TYPE bloom_filter GRANULARITY 4,
    INDEX idx_kind kind TYPE minmax GRANULARITY 4,
    INDEX idx_httpCode httpCode TYPE set(0) GRANULARITY 1,
    INDEX idx_hasError hasError TYPE set(2) GRANULARITY 1,
    INDEX idx_attributesMapKeys mapKeys(attributesMap) TYPE bloom_filter(0.01) GRANULARITY 64,
    INDEX idx_attributesMapValues mapValues(attributesMap) TYPE bloom_filter(0.01) GRANULARITY 64,
    INDEX idx_httpRoute httpRoute TYPE bloom_filter GRANULARITY 4,
    INDEX idx_httpUrl httpUrl TYPE bloom_filter GRANULARITY 4,
    INDEX idx_httpHost httpHost TYPE bloom_filter GRANULARITY 4,
    INDEX idx_httpMethod httpMethod TYPE bloom_filter GRANULARITY 4,
    INDEX idx_rpcMethod rpcMethod TYPE bloom_filter GRANULARITY 4,
    INDEX idx_responseStatusCode responseStatusCode TYPE set(0) GRANULARITY 1,
    INDEX idx_resourceTagsMapKeys mapKeys(resourcesMap) TYPE bloom_filter(0.01) GRANULARITY 64,
    INDEX idx_resourceTagsMapValues mapValues(resourcesMap) TYPE bloom_filter(0.01) GRANULARITY 64,
)
ENGINE = MergeTree
PARTITION BY toDate(startTime / 1000000000)
ORDER BY (startTime, tenantId, environment, serviceName, name)
TTL toDateTime(startTime / 1000000000) + INTERVAL 1296000 SECOND DELETE
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1

CREATE TABLE IF NOT EXISTS signoz_traces.distributed_signoz_index_v2 ON CLUSTER cluster AS signoz_traces.signoz_index_v2
ENGINE = Distributed("cluster", "signoz_traces", signoz_index_v2, cityHash64(traceId));

CREATE TABLE span_attributes
(
    `startTime` UInt64 CODEC(DoubleDelta, LZ4),
    `tagKey` LowCardinality(String) CODEC(ZSTD(1)),
    `tagType` Enum8('tag' = 1, 'resource' = 2) CODEC(ZSTD(1)),
    `dataType` Enum8('string' = 1, 'bool' = 2, 'float64' = 3) CODEC(ZSTD(1)),
    `stringTagValue` String CODEC(ZSTD(1)),
    `float64TagValue` Nullable(Float64) CODEC(ZSTD(1)),
    `isColumn` Bool CODEC(ZSTD(1))
)
ENGINE = ReplacingMergeTree
ORDER BY (tagKey, tagType, dataType, stringTagValue, float64TagValue, isColumn)
TTL toDateTime(startTime / 1000000000)  + toIntervalSecond(172800)
SETTINGS ttl_only_drop_parts = 1, allow_nullable_key = 1, index_granularity = 8192

CREATE TABLE IF NOT EXISTS signoz_traces.distributed_span_attributes ON CLUSTER cluster AS signoz_traces.span_attributes
ENGINE = Distributed("cluster", "signoz_traces", span_attributes, cityHash64(rand()));

CREATE TABLE signoz_traces.signoz_spans
(
    `startTime` UInt64 CODEC(DoubleDelta, LZ4),
    `traceId` FixedString(32) CODEC(ZSTD(1)),
    `model` String CODEC(ZSTD(9))
)
ENGINE = MergeTree
PARTITION BY toDate(startTime / 1000000000)
ORDER BY traceId
TTL toDateTime(startTime / 1000000000)  + toIntervalSecond(604800)
SETTINGS index_granularity = 1024, ttl_only_drop_parts = 1

CREATE TABLE IF NOT EXISTS signoz_traces.distributed_signoz_spans ON CLUSTER cluster AS signoz_traces.signoz_spans
ENGINE = Distributed("cluster", "signoz_traces", signoz_spans, cityHash64(traceId));

CREATE MATERIALIZED VIEW IF NOT EXISTS signoz_traces.usage_explorer_mv ON CLUSTER cluster
TO signoz_traces.usage_explorer
AS SELECT
  toStartOfHour(toDateTime(startTime)) as timestamp,
  serviceName as service_name,
  count() as count
FROM signoz_traces.signoz_index_v2
GROUP BY timestamp, serviceName;


CREATE MATERIALIZED VIEW IF NOT EXISTS signoz_traces.sub_root_operations ON CLUSTER cluster
TO signoz_traces.top_level_operations
AS SELECT DISTINCT
    name,
    serviceName
FROM signoz_traces.signoz_index_v2 AS A, signoz_traces.signoz_index_v2 AS B
WHERE (A.serviceName != B.serviceName) AND (A.parentId = B.spanId);

CREATE MATERIALIZED VIEW IF NOT EXISTS signoz_traces.root_operations ON CLUSTER cluster
TO signoz_traces.top_level_operations
AS SELECT DISTINCT
    name,
    serviceName
FROM signoz_traces.signoz_index_v2
WHERE parentId = '';



CREATE MATERIALIZED VIEW IF NOT EXISTS signoz_traces.durationSortMV ON CLUSTER cluster
TO signoz_traces.durationSort
AS SELECT
  startTime,
  traceId,
  spanId,
  parentId,
  serviceName,
  name,
  kind,
  duration,
  statusCode,
  component,
  httpMethod,
  httpUrl,
  httpCode,
  httpRoute,
  httpHost,
  gRPCMethod,
  gRPCCode,
  hasError,
  rpcSystem,
  rpcService,
  rpcMethod,
  responseStatusCode,
  attributesMap,
  stringAttributesMap,
  numberAttributesMap,
  boolAttributesMap
FROM signoz_traces.signoz_index_v2
ORDER BY duration, startTime;