CREATE TABLE observex_metrics.time_series
(
    tenantId LowCardinality(String)  DEFAULT 'default',
    environment LowCardinality(String) DEFAULT 'default',
    serviceName LowCardinality(String) CODEC(ZSTD(1)),
    temporality LowCardinality(String) DEFAULT 'Unspecified',
    metric_name LowCardinality(String),
    fingerprint UInt64 CODEC(Delta(8), ZSTD(1)),
    timestamp_ms Int64 CODEC(Delta(8), ZSTD(1)),
    labels String CODEC(ZSTD(5))
)
ENGINE = ReplacingMergeTree
PARTITION BY toDate(timestamp_ms / 1000)
ORDER BY (tenantId,environment,serviceName, temporality, metric_name, fingerprint)
TTL toDateTime(timestamp_ms / 1000) + INTERVAL 1296000 SECOND DELETE
SETTINGS index_granularity = 8192

CREATE TABLE IF NOT EXISTS observex_metrics.distributed_time_series ON CLUSTER cluster AS observex_metrics.time_series ENGINE = Distributed("cluster", observex_metrics, time_series, rand());


CREATE TABLE observex_metrics.samples
(
    `metric_name` LowCardinality(String),
    `fingerprint` UInt64 CODEC(DoubleDelta, LZ4),
    `timestamp_ms` Int64 CODEC(DoubleDelta, LZ4),
    `value` Float64 CODEC(Gorilla, LZ4)
)
ENGINE = MergeTree
PARTITION BY toDate(timestamp_ms / 1000)
ORDER BY (metric_name, fingerprint, timestamp_ms)
TTL toDateTime(timestamp_ms / 1000) + toIntervalSecond(2592000)
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1


CREATE TABLE IF NOT EXISTS observex_metrics.distributed_samples ON CLUSTER cluster AS observex_metrics.samples ENGINE = Distributed("cluster", "observex_metrics", samples, cityHash64(metric_name, fingerprint));

