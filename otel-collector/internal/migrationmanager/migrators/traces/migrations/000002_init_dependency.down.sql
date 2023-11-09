DROP TABLE IF EXISTS xobserve_traces.dependency_graph_minutes ON CLUSTER cluster;
DROP TABLE IF EXISTS xobserve_traces.distributed_dependency_graph_minutes ON CLUSTER cluster;

DROP VIEW IF EXISTS  xobserve_traces.dependency_graph_minutes_service_calls_mv ON CLUSTER cluster;
DROP VIEW IF EXISTS  xobserve_traces.dependency_graph_minutes_db_calls_mv ON CLUSTER cluster;
DROP VIEW IF EXISTS  xobserve_traces.dependency_graph_minutes_messaging_calls_mv ON CLUSTER cluster;