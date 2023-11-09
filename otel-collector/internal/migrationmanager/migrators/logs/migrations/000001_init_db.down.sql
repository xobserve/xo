DROP TABLE IF EXISTS xobserve_logs.logs ON CLUSTER cluster;
DROP TABLE IF EXISTS xobserve_logs.distributed_logs ON CLUSTER cluster;
DROP TABLE IF EXISTS xobserve_logs.logs_atrribute_keys ON CLUSTER cluster;
DROP TABLE IF EXISTS xobserve_logs.distributed_logs_atrribute_keys ON CLUSTER cluster;
DROP TABLE IF EXISTS xobserve_logs.logs_resource_keys ON CLUSTER cluster;
DROP TABLE IF EXISTS xobserve_logs.distributed_logs_resource_keys ON CLUSTER cluster;
DROP TABLE IF EXISTS xobserve_logs.log_tag_attributes ON CLUSTER cluster;
DROP TABLE IF EXISTS xobserve_logs.distributed_log_tag_attributes ON CLUSTER cluster;


DROP VIEW IF EXISTS atrribute_keys_string_final_mv ON CLUSTER cluster;
DROP VIEW IF EXISTS atrribute_keys_int64_final_mv ON CLUSTER cluster;
DROP VIEW IF EXISTS atrribute_keys_float64_final_mv ON CLUSTER cluster;
DROP VIEW IF EXISTS resource_keys_string_final_mv ON CLUSTER cluster;

