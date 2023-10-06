---
title: MetricsQL
nav_title: MetricsQL
sort_rank: 1
---

[Read original docs](https://docs.victoriametrics.com/MetricsQL.html)

---

[VictoriaMetrics](https://github.com/VictoriaMetrics/VictoriaMetrics) implements MetricsQL -
query language inspired by [PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/).
MetricsQL is backwards-compatible with PromQL, so Grafana dashboards backed by Prometheus datasource should work
the same after switching from Prometheus to VictoriaMetrics.
However, there are some [intentional differences](https://medium.com/@romanhavronenko/victoriametrics-promql-compliance-d4318203f51e) between these two languages.

[Standalone MetricsQL package](https://godoc.org/github.com/VictoriaMetrics/metricsql) can be used for parsing MetricsQL in external apps.

If you are unfamiliar with PromQL, then it is suggested reading [this tutorial for beginners](https://medium.com/@valyala/promql-tutorial-for-beginners-9ab455142085).

The following functionality is implemented differently in MetricsQL compared to PromQL. This improves user experience:

* MetricsQL takes into account the previous point before the window in square brackets for range functions such as [rate](#rate) and [increase](#increase).
  This allows returning the exact results users expect for `increase(metric[$__interval])` queries instead of incomplete results Prometheus returns for such queries.
* MetricsQL doesn't extrapolate range function results. This addresses [this issue from Prometheus](https://github.com/prometheus/prometheus/issues/3746).
  See technical details about VictoriaMetrics and Prometheus calculations for [rate](#rate)
  and [increase](#increase) [in this issue](https://github.com/VictoriaMetrics/VictoriaMetrics/issues/1215#issuecomment-850305711).
* MetricsQL returns the expected non-empty responses for [rate](#rate) with `step` values smaller than scrape interval.
  This addresses [this issue from Grafana](https://github.com/grafana/grafana/issues/11451).
  See also [this blog post](https://www.percona.com/blog/2020/02/28/better-prometheus-rate-function-with-victoriametrics/).
* MetricsQL treats `scalar` type the same as `instant vector` without labels, since subtle differences between these types usually confuse users.
  See [the corresponding Prometheus docs](https://prometheus.io/docs/prometheus/latest/querying/basics/#expression-language-data-types) for details.
* MetricsQL removes all the `NaN` values from the output, so some queries like `(-1)^0.5` return empty results in VictoriaMetrics,
  while returning a series of `NaN` values in Prometheus. Note that Grafana doesn't draw any lines or dots for `NaN` values,
  so the end result looks the same for both VictoriaMetrics and Prometheus.
* MetricsQL keeps metric names after applying functions, which don't change the meaning of the original time series.
  For example, [min_over_time(foo)](#min_over_time) or [round(foo)](#round) leaves `foo` metric name in the result.
  See [this issue](https://github.com/VictoriaMetrics/VictoriaMetrics/issues/674) for details.

Read more about the differences between PromQL and MetricsQL in [this article](https://medium.com/@romanhavronenko/victoriametrics-promql-compliance-d4318203f51e).

Other PromQL functionality should work the same in MetricsQL.
[File an issue](https://github.com/VictoriaMetrics/VictoriaMetrics/issues) if you notice discrepancies between PromQL and MetricsQL results other than mentioned above.

## MetricsQL features

MetricsQL implements [PromQL](https://medium.com/@valyala/promql-tutorial-for-beginners-9ab455142085)
and provides additional functionality mentioned below, which is aimed towards solving practical cases.
Feel free [filing a feature request](https://github.com/VictoriaMetrics/VictoriaMetrics/issues) if you think MetricsQL misses certain useful functionality.

This functionality can be evaluated at [VictoriaMetrics playground](https://play.victoriametrics.com/select/accounting/1/6a716b0f-38bc-4856-90ce-448fd713e3fe/prometheus/graph/)
or at your own [VictoriaMetrics instance](https://docs.victoriametrics.com/#how-to-start-victoriametrics).

The list of MetricsQL features on top of PromQL:

* Graphite-compatible filters can be passed via `{__graphite__="foo.*.bar"}` syntax.
  See [these docs](https://docs.victoriametrics.com/#selecting-graphite-metrics).
  VictoriaMetrics also can be used as Graphite datasource in Grafana.
  See [these docs](https://docs.victoriametrics.com/#graphite-api-usage) for details.
  See also [label_graphite_group](#label_graphite_group) function, which can be used for extracting the given groups from Graphite metric name.
* Lookbehind window in square brackets may be omitted. VictoriaMetrics automatically selects the lookbehind window
  depending on the current step used for building the graph (e.g. `step` query arg passed to [/api/v1/query_range](https://docs.victoriametrics.com/keyConcepts.html#range-query)).
  For instance, the following query is valid in VictoriaMetrics: `rate(node_network_receive_bytes_total)`.
  It is equivalent to `rate(node_network_receive_bytes_total[$__interval])` when used in Grafana.
* Numeric values can contain `_` delimiters for better readability. For example, `1_234_567_890` can be used in queries instead of `1234567890`.
* [Series selectors](https://docs.victoriametrics.com/keyConcepts.html#filtering) accept multiple `or` filters. For example, `{env="prod",job="a" or env="dev",job="b"}`
  selects series with either `{env="prod",job="a"}` or `{env="dev",job="b"}` labels.
  See [these docs](https://docs.victoriametrics.com/keyConcepts.html#filtering-by-multiple-or-filters) for details.
* Support for `group_left(*)` and `group_right(*)` for copying all the labels from time series on the `one` side
  of [many-to-one operations](https://prometheus.io/docs/prometheus/latest/querying/operators/#many-to-one-and-one-to-many-vector-matches).
  The copied label names may clash with the existing label names, so MetricsQL provides an ability to add prefix to the copied metric names
  via `group_left(*) prefix "..."` syntax.
  For example, the following query copies all the `namespace`-related labels from `kube_namespace_labels` to `kube_pod_info` series,
  while adding `ns_` prefix to the copied labels: `kube_pod_info * on(namespace) group_left(*) prefix "ns_" kube_namespace_labels`.
  Labels from the `on()` list aren't copied.
* [Aggregate functions](#aggregate-functions) accept arbitrary number of args.
  For example, `avg(q1, q2, q3)` would return the average values for every point across time series returned by `q1`, `q2` and `q3`.
* [@ modifier](https://prometheus.io/docs/prometheus/latest/querying/basics/#modifier) can be put anywhere in the query.
  For example, `sum(foo) @ end()` calculates `sum(foo)` at the `end` timestamp of the selected time range `[start ... end]`.
* Arbitrary subexpression can be used as [@ modifier](https://prometheus.io/docs/prometheus/latest/querying/basics/#modifier).
  For example, `foo @ (end() - 1h)` calculates `foo` at the `end - 1 hour` timestamp on the selected time range `[start ... end]`.
* [offset](https://prometheus.io/docs/prometheus/latest/querying/basics/#offset-modifier), lookbehind window in square brackets
  and `step` value for [subquery](#subqueries) may refer to the current step aka `$__interval` value from Grafana with `[Ni]` syntax.
  For instance, `rate(metric[10i] offset 5i)` would return per-second rate over a range covering 10 previous steps with the offset of 5 steps.
* [offset](https://prometheus.io/docs/prometheus/latest/querying/basics/#offset-modifier) may be put anywhere in the query. For instance, `sum(foo) offset 24h`.
* Lookbehind window in square brackets and [offset](https://prometheus.io/docs/prometheus/latest/querying/basics/#offset-modifier) may be fractional.
  For instance, `rate(node_network_receive_bytes_total[1.5m] offset 0.5d)`.
* The duration suffix is optional. The duration is in seconds if the suffix is missing.
  For example, `rate(m[300] offset 1800)` is equivalent to `rate(m[5m]) offset 30m`.
* The duration can be placed anywhere in the query. For example, `sum_over_time(m[1h]) / 1h` is equivalent to `sum_over_time(m[1h]) / 3600`.
* Numeric values can have `K`, `Ki`, `M`, `Mi`, `G`, `Gi`, `T` and `Ti` suffixes. For example, `8K` is equivalent to `8000`, while `1.2Mi` is equivalent to `1.2*1024*1024`.
* Trailing commas on all the lists are allowed - label filters, function args and with expressions.
  For instance, the following queries are valid: `m{foo="bar",}`, `f(a, b,)`, `WITH (x=y,) x`.
  This simplifies maintenance of multi-line queries.
* Metric names and label names may contain any unicode letter. For example `температура{город="Киев"}` is a value MetricsQL expression.
* Metric names and labels names may contain escaped chars. For example, `foo\-bar{baz\=aa="b"}` is valid expression.
  It returns time series with name `foo-bar` containing label `baz=aa` with value `b`.
  Additionally, the following escape sequences are supported:
  - `\xXX`, where `XX` is hexadecimal representation of the escaped ascii char.
  - `\uXXXX`, where `XXXX` is a hexadecimal representation of the escaped unicode char.
* Aggregate functions support optional `limit N` suffix in order to limit the number of output series.
  For example, `sum(x) by (y) limit 3` limits the number of output time series after the aggregation to 3.
  All the other time series are dropped.
* [histogram_quantile](#histogram_quantile) accepts optional third arg - `boundsLabel`.
  In this case it returns `lower` and `upper` bounds for the estimated percentile.
  See [this issue for details](https://github.com/prometheus/prometheus/issues/5706).
* `default` binary operator. `q1 default q2` fills gaps in `q1` with the corresponding values from `q2`.
* `if` binary operator. `q1 if q2` removes values from `q1` for missing values from `q2`.
* `ifnot` binary operator. `q1 ifnot q2` removes values from `q1` for existing values from `q2`.
* `WITH` templates. This feature simplifies writing and managing complex queries.
  Go to [WITH templates playground](https://play.victoriametrics.com/select/accounting/1/6a716b0f-38bc-4856-90ce-448fd713e3fe/expand-with-exprs) and try it.
* String literals may be concatenated. This is useful with `WITH` templates:
  `WITH (commonPrefix="long_metric_prefix_") {__name__=commonPrefix+"suffix1"} / {__name__=commonPrefix+"suffix2"}`.
* `keep_metric_names` modifier can be applied to all the [rollup functions](#rollup-functions), [transform functions](#transform-functions) and [binary operators](https://prometheus.io/docs/prometheus/latest/querying/operators/#binary-operators).
  This modifier prevents from dropping metric names in function results. See [these docs](#keep_metric_names).

## keep_metric_names

By default, metric names are dropped after applying functions or [binary operators](https://prometheus.io/docs/prometheus/latest/querying/operators/#binary-operators),
since they may change the meaning of the original time series.
This may result in `duplicate time series` error when the function is applied to multiple time series with different names.
This error can be fixed by applying `keep_metric_names` modifier to the function or binary operator.

For example:
- `rate({__name__=~"foo|bar"}) keep_metric_names` leaves `foo` and `bar` metric names in the returned time series.
- `({__name__=~"foo|bar"} / 10) keep_metric_names` leaves `foo` and `bar` metric names in the returned time series.

## Subqueries

MetricsQL supports and extends PromQL subqueries. See [this article](https://valyala.medium.com/prometheus-subqueries-in-victoriametrics-9b1492b720b3) for details.
Any [rollup function](#rollup-functions) for something other than [series selector](https://docs.victoriametrics.com/keyConcepts.html#filtering) form a subquery.
Nested rollup functions can be implicit thanks to the [implicit query conversions](#implicit-query-conversions).
For example, `delta(sum(m))` is implicitly converted to `delta(sum(default_rollup(m[1i]))[1i:1i])`, so it becomes a subquery,
since it contains [default_rollup](#default_rollup) nested into [delta](#delta).

VictoriaMetrics performs subqueries in the following way:

* It calculates the inner rollup function using the `step` value from the outer rollup function.
  For example, for expression `max_over_time(rate(http_requests_total[5m])[1h:30s])` the inner function `rate(http_requests_total[5m])`
  is calculated with `step=30s`. The resulting data points are aligned by the `step`.
* It calculates the outer rollup function over the results of the inner rollup function using the `step` value
  passed by Grafana to [/api/v1/query_range](https://docs.victoriametrics.com/keyConcepts.html#range-query).

## Implicit query conversions

VictoriaMetrics performs the following implicit conversions for incoming queries before starting the calculations:

* If lookbehind window in square brackets is missing inside [rollup function](#rollup-functions),
  then `[1i]` is automatically added there. The `[1i]` means one `step` value, which is passed
  to [/api/v1/query_range](https://docs.victoriametrics.com/keyConcepts.html#range-query).
  It is also known as `$__interval` in Grafana. For example, `rate(http_requests_count)` is automatically transformed to `rate(http_requests_count[1i])`.
* All the [series selectors](https://docs.victoriametrics.com/keyConcepts.html#filtering),
  which aren't wrapped into [rollup functions](#rollup-functions), are automatically wrapped into [default_rollup](#default_rollup) function.
  Examples:
  * `foo` is transformed to `default_rollup(foo[1i])`
  * `foo + bar` is transformed to `default_rollup(foo[1i]) + default_rollup(bar[1i])`
  * `count(up)` is transformed to `count(default_rollup(up[1i]))`, because [count](#count) isn't a [rollup function](#rollup-functions) -
    it is [aggregate function](#aggregate-functions)
  * `abs(temperature)` is transformed to `abs(default_rollup(temperature[1i]))`, because [abs](#abs) isn't a [rollup function](#rollup-functions) -
    it is [transform function](#transform-functions)
* If `step` in square brackets is missing inside [subquery](#subqueries), then `1i` step is automatically added there.
  For example, `avg_over_time(rate(http_requests_total[5m])[1h])` is automatically converted to `avg_over_time(rate(http_requests_total[5m])[1h:1i])`.
* If something other than [series selector](https://docs.victoriametrics.com/keyConcepts.html#filtering)
  is passed to [rollup function](#rollup-functions), then a [subquery](#subqueries) with `1i` lookbehind window and `1i` step is automatically formed.
  For example, `rate(sum(up))` is automatically converted to `rate((sum(default_rollup(up[1i])))[1i:1i])`.
