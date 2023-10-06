---
title: Plugin motivation
nav_title: Motivation
sort_rank: 4
---

[Read original docs](https://github.com/VictoriaMetrics/grafana-datasource/tree/main#motivation)

---

Thanks to VictoriaMetrics compatibility with Prometheus API users can use
[Prometheus datasource](https://docs.victoriametrics.com/#grafana-setup) for Grafana to query data from VictoriaMetrics.
But with time, Prometheus and VictoriaMetrics diverge more and more. After some unexpected changes to Prometheus datasource
we decided to create a datasource plugin specifically for VictoriaMetrics.
The benefits of using VictoriaMetrics plugin are the following:

* [MetricsQL](https://docs.victoriametrics.com/MetricsQL.html) functions support;
* Supports [query tracing](https://docs.victoriametrics.com/Single-server-VictoriaMetrics.html#query-tracing) in Explore mode or right in panel's expressions;
* Supports [WITH expressions](https://github.com/VictoriaMetrics/grafana-datasource#how-to-use-with-templates);
* Plugin fixes [label names validation](https://github.com/grafana/grafana/issues/42615) issue;
* Integration with [vmui](https://docs.victoriametrics.com/#vmui).
