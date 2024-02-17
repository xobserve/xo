CREATE TABLE IF NOT EXISTS xobserve_logs.logs ON CLUSTER cluster  (
	timestamp UInt64 CODEC(DoubleDelta, LZ4),
	observed_timestamp UInt64 CODEC(DoubleDelta, LZ4),
	id String CODEC(ZSTD(1)),
	trace_id String CODEC(ZSTD(1)),
	span_id String CODEC(ZSTD(1)),
	trace_flags UInt32,
	severity LowCardinality(String) CODEC(ZSTD(1)),
	severity_number UInt8,
	body String CODEC(ZSTD(2)),

	teamId UInt64 CODEC(ZSTD(1)), 
	cluster LowCardinality(String) CODEC(ZSTD(1)),
    namespace LowCardinality(String) CODEC(ZSTD(1)),
	service String CODEC(ZSTD(1)),
  	host String CODEC(ZSTD(1)),

	resources_string_key Array(String) CODEC(ZSTD(1)),
	resources_string_value Array(String) CODEC(ZSTD(1)),
  	attributes_string_key Array(String) CODEC(ZSTD(1)),
	attributes_string_value Array(String) CODEC(ZSTD(1)),
	attributes_int64_key Array(String) CODEC(ZSTD(1)),
	attributes_int64_value Array(Int64) CODEC(ZSTD(1)),
	attributes_float64_key Array(String) CODEC(ZSTD(1)),
	attributes_float64_value Array(Float64) CODEC(ZSTD(1)),

  -- _resources Map(LowCardinality(String), String) MATERIALIZED CAST((resources_string_key, resources_string_value), 'Map(String, String)'),
  -- _string_attributes Map(LowCardinality(String), String) MATERIALIZED CAST((attributes_string_key, attributes_string_value), 'Map(String, String)'),
  -- _int_attributes Map(LowCardinality(String), Int64) MATERIALIZED CAST((attributes_int64_key, attributes_int64_value), 'Map(String, Int64)'),
  -- _float_attributes Map(LowCardinality(String), Float64) MATERIALIZED CAST((attributes_float64_key, attributes_float64_value), 'Map(String, Float64)'),

	INDEX idx_trace_id  trace_id  TYPE bloom_filter(0.001) GRANULARITY 1,
	INDEX idx_id        id        TYPE bloom_filter(0.001) GRANULARITY 1,
	INDEX idx_host      host      TYPE bloom_filter(0.01) GRANULARITY 1,
	INDEX body_idx      body      TYPE tokenbf_v1(10240, 3, 0) GRANULARITY 4,
	INDEX idx_cluster cluster TYPE bloom_filter GRANULARITY 4,
    INDEX idx_namespace namespace TYPE bloom_filter GRANULARITY 4
) ENGINE MergeTree
PARTITION BY toDate(timestamp / 1000000000)
ORDER BY (timestamp, teamId, service, host)
TTL toDateTime(timestamp / 1000000000) + INTERVAL 1296000 SECOND DELETE
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1

CREATE TABLE IF NOT EXISTS xobserve_logs.distributed_logs ON CLUSTER cluster  AS xobserve_logs.logs
ENGINE = Distributed("cluster","xobserve_logs", logs, cityHash64(id));


CREATE TABLE IF NOT EXISTS xobserve_logs.logs_atrribute_keys ON CLUSTER cluster (
name String,
datatype String
)ENGINE = ReplacingMergeTree
ORDER BY (name, datatype);

CREATE TABLE IF NOT EXISTS xobserve_logs.distributed_logs_atrribute_keys  ON CLUSTER cluster AS xobserve_logs.logs_atrribute_keys
ENGINE = Distributed("cluster", "xobserve_logs", logs_atrribute_keys, cityHash64(datatype));

CREATE TABLE IF NOT EXISTS xobserve_logs.logs_resource_keys ON CLUSTER cluster (
name String,
datatype String
)ENGINE = ReplacingMergeTree
ORDER BY (name, datatype);

CREATE TABLE IF NOT EXISTS xobserve_logs.distributed_logs_resource_keys  ON CLUSTER cluster AS xobserve_logs.logs_resource_keys
ENGINE = Distributed("cluster", "xobserve_logs", logs_resource_keys, cityHash64(datatype));

CREATE TABLE IF NOT EXISTS xobserve_logs.log_tag_attributes ON CLUSTER cluster (
    timestamp DateTime CODEC(ZSTD(1)), 
    tagKey LowCardinality(String) CODEC(ZSTD(1)),
    tagType Enum('tag', 'resource') CODEC(ZSTD(1)),
    tagDataType Enum('string', 'bool', 'int64', 'float64') CODEC(ZSTD(1)),
    stringTagValue String CODEC(ZSTD(1)),
    int64TagValue Nullable(Int64) CODEC(ZSTD(1)),
    float64TagValue Nullable(Float64) CODEC(ZSTD(1))
) ENGINE ReplacingMergeTree
ORDER BY (tagKey, tagType, tagDataType, stringTagValue, int64TagValue, float64TagValue)
TTL toDateTime(timestamp) + INTERVAL 172800 SECOND DELETE
SETTINGS ttl_only_drop_parts = 1, allow_nullable_key = 1;

CREATE TABLE IF NOT EXISTS xobserve_logs.distributed_log_tag_attributes ON CLUSTER cluster AS xobserve_logs.log_tag_attributes
ENGINE = Distributed("cluster", "xobserve_logs", log_tag_attributes, rand());


CREATE MATERIALIZED VIEW IF NOT EXISTS  atrribute_keys_string_final_mv ON CLUSTER cluster TO xobserve_logs.logs_atrribute_keys AS
SELECT
distinct arrayJoin(attributes_string_key) as name, 'String' datatype
FROM xobserve_logs.logs
ORDER BY name;

CREATE MATERIALIZED VIEW IF NOT EXISTS  atrribute_keys_int64_final_mv ON CLUSTER cluster  TO xobserve_logs.logs_atrribute_keys AS
SELECT
distinct arrayJoin(attributes_int64_key) as name, 'Int64' datatype
FROM xobserve_logs.logs
ORDER BY  name;

CREATE MATERIALIZED VIEW IF NOT EXISTS  atrribute_keys_float64_final_mv ON CLUSTER cluster TO xobserve_logs.logs_atrribute_keys AS
SELECT
distinct arrayJoin(attributes_float64_key) as name, 'Float64' datatype
FROM xobserve_logs.logs
ORDER BY  name;

CREATE MATERIALIZED VIEW IF NOT EXISTS  resource_keys_string_final_mv ON CLUSTER cluster  TO xobserve_logs.logs_resource_keys AS
SELECT
distinct arrayJoin(resources_string_key) as name, 'String' datatype
FROM xobserve_logs.logs
ORDER BY  name;



