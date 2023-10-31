CREATE TABLE datav_traces.trace_index
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

CREATE TABLE IF NOT EXISTS datav_traces.distributed_trace_index ON CLUSTER cluster AS datav_traces.trace_index
ENGINE = Distributed("cluster", "datav_traces", trace_index, cityHash64(traceId));

CREATE TABLE datav_traces.span_attributes
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

CREATE TABLE IF NOT EXISTS datav_traces.distributed_span_attributes ON CLUSTER cluster AS datav_traces.span_attributes
ENGINE = Distributed("cluster", "datav_traces", span_attributes, cityHash64(rand()));

CREATE TABLE datav_traces.trace_spans
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

CREATE TABLE IF NOT EXISTS datav_traces.distributed_trace_spans ON CLUSTER cluster AS datav_traces.trace_spans
ENGINE = Distributed("cluster", "datav_traces", trace_spans, cityHash64(traceId));

CREATE TABLE datav_traces.top_level_operations
(
    `name` LowCardinality(String) CODEC(ZSTD(1)),
    `serviceName` LowCardinality(String) CODEC(ZSTD(1))
)
ENGINE = ReplacingMergeTree
ORDER BY (serviceName, name)
SETTINGS index_granularity = 8192

CREATE TABLE IF NOT EXISTS datav_traces.distributed_top_level_operations ON CLUSTER cluster AS datav_traces.top_level_operations
ENGINE = Distributed("cluster", "datav_traces", top_level_operations, cityHash64(rand()));

CREATE MATERIALIZED VIEW IF NOT EXISTS datav_traces.usage_explorer_mv ON CLUSTER cluster
TO datav_traces.usage_explorer
AS SELECT
  toStartOfHour(toDateTime(startTime)) as timestamp,
  serviceName as service_name,
  count() as count
FROM datav_traces.trace_index
GROUP BY timestamp, serviceName;


CREATE MATERIALIZED VIEW IF NOT EXISTS datav_traces.sub_root_operations_mv ON CLUSTER cluster
TO datav_traces.top_level_operations
AS SELECT DISTINCT
    name,
    serviceName
FROM datav_traces.trace_index AS A, datav_traces.trace_index AS B
WHERE (A.serviceName != B.serviceName) AND (A.parentId = B.spanId);

CREATE MATERIALIZED VIEW IF NOT EXISTS datav_traces.root_operations_mv ON CLUSTER cluster
TO datav_traces.top_level_operations
AS SELECT DISTINCT
    name,
    serviceName
FROM datav_traces.trace_index
WHERE parentId = '';


CREATE TABLE datav_traces.usage_explorer
(
    `timestamp` DateTime64(9) CODEC(DoubleDelta, LZ4),
    `service_name` LowCardinality(String) CODEC(ZSTD(1)),
    `count` UInt64 CODEC(T64, ZSTD(1))
)
ENGINE = SummingMergeTree
PARTITION BY toDate(timestamp)
ORDER BY (timestamp, service_name)
TTL toDateTime(timestamp) + toIntervalSecond(604800)
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1

CREATE TABLE IF NOT EXISTS datav_traces.distributed_usage_explorer ON CLUSTER cluster AS datav_traces.usage_explorer
ENGINE = Distributed("cluster", "datav_traces", usage_explorer, cityHash64(rand()));


CREATE TABLE datav_traces.trace_error_index
(
    `timestamp` DateTime64(9) CODEC(DoubleDelta, LZ4),
    `errorID` FixedString(32) CODEC(ZSTD(1)),
    `groupID` FixedString(32) CODEC(ZSTD(1)),
    `traceID` FixedString(32) CODEC(ZSTD(1)),
    `spanID` String CODEC(ZSTD(1)),
    `serviceName` LowCardinality(String) CODEC(ZSTD(1)),
    `exceptionType` LowCardinality(String) CODEC(ZSTD(1)),
    `exceptionMessage` String CODEC(ZSTD(1)),
    `exceptionStacktrace` String CODEC(ZSTD(1)),
    `exceptionEscaped` Bool CODEC(T64, ZSTD(1)),
    `resourceTagsMap` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    INDEX idx_error_id errorID TYPE bloom_filter GRANULARITY 4,
    INDEX idx_resourceTagsMapKeys mapKeys(resourceTagsMap) TYPE bloom_filter(0.01) GRANULARITY 64,
    INDEX idx_resourceTagsMapValues mapValues(resourceTagsMap) TYPE bloom_filter(0.01) GRANULARITY 64
)
ENGINE = MergeTree
PARTITION BY toDate(timestamp)
ORDER BY (timestamp, groupID)
TTL toDateTime(timestamp) + toIntervalSecond(604800)
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1

CREATE TABLE IF NOT EXISTS datav_traces.distributed_trace_error_index ON CLUSTER cluster AS datav_traces.trace_error_index
ENGINE = Distributed("cluster", "datav_traces", trace_error_index, cityHash64(groupID));


CREATE TABLE datav_traces.span_attributes_keys
(
    `tagKey` LowCardinality(String) CODEC(ZSTD(1)),
    `tagType` Enum8('tag' = 1, 'resource' = 2) CODEC(ZSTD(1)),
    `dataType` Enum8('string' = 1, 'bool' = 2, 'float64' = 3) CODEC(ZSTD(1)),
    `isColumn` Bool CODEC(ZSTD(1))
)
ENGINE = ReplacingMergeTree
ORDER BY (tagKey, tagType, dataType, isColumn)
SETTINGS index_granularity = 8192

CREATE TABLE IF NOT EXISTS datav_traces.distributed_span_attributes_keys ON CLUSTER cluster AS datav_traces.span_attributes_keys
ENGINE = Distributed("cluster", "datav_traces", span_attributes_keys, cityHash64(rand()));