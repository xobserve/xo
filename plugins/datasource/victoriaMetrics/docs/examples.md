---
title: Querying examples
nav_title: Examples
sort_rank: 4
---

[Read original docs](https://docs.victoriametrics.com/keyConcepts.html#metricsql)

---

VictoriaMetrics provide a special query language for executing read queries - [MetricsQL](https://docs.victoriametrics.com/MetricsQL.html).
It is a [PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics)-like query language with a powerful set of
functions and features for working specifically with time series data. MetricsQL is backward-compatible with PromQL,
so it shares most of the query concepts. The basic concepts for PromQL and MetricsQL are
described [here](https://valyala.medium.com/promql-tutorial-for-beginners-9ab455142085).

#### Filtering

In sections [instant query](#instant-query) and [range query](#range-query) we've already used MetricsQL to get data for
metric `foo_bar`. It is as simple as just writing a metric name in the query:

    foo_bar

A single metric name may correspond to multiple time series with distinct label sets. For example:

    requests_total{path="/", code="200"} 
    requests_total{path="/", code="403"} 

To select only time series with specific label value specify the matching filter in curly braces:

    requests_total{code="200"} 

The query above returns all time series with the name `requests_total` and label `code="200"`. We use the operator `=` to
match label value. For negative match use `!=` operator. Filters also support positive regex matching via `=~`
and negative regex matching via `!~`:

    requests_total{code=~"2.*"}

Filters can also be combined:

    requests_total{code=~"200", path="/home"}

The query above returns all time series with `requests_total` name, which simultaneously have labels `code="200"` and `path="/home"`.

#### Filtering by name

Sometimes it is required to return all the time series for multiple metric names. As was mentioned in
the [data model section](#data-model), the metric name is just an ordinary label with a special name - `__name__`. So
filtering by multiple metric names may be performed by applying regexps on metric names:

    {__name__=~"requests_(error|success)_total"}

The query above returns series for two metrics: `requests_error_total` and `requests_success_total`.

#### Filtering by multiple "or" filters

[MetricsQL](https://docs.victoriametrics.com/MetricsQL.html) supports selecting time series, which match at least one of multiple "or" filters.
Such filters must be delimited by `or` inside curly braces. For example, the following query selects time series with
either `{job="app1",env="prod"}` or `{job="app2",env="dev"}` labels:

    {job="app1",env="prod" or job="app2",env="dev"}

The number of `or` groups can be arbitrary. The number of `,`-delimited label filters per each `or` group can be arbitrary.
Per-group filters are applied with `and` operation, e.g. they select series simultaneously matching all the filters in the group.

This functionality allows passing the selected series to [rollup functions](https://docs.victoriametrics.com/MetricsQL.html#rollup-functions)
such as [rate()](https://docs.victoriametrics.com/MetricsQL.html#rate)
without the need to use [subqueries](https://docs.victoriametrics.com/MetricsQL.html#subqueries):

    rate({job="app1",env="prod" or job="app2",env="dev"}[5m])

If you need to select series matching multiple filters for the same label, then it is better from performance PoV
to use regexp filter `{label=~"value1|...|valueN"}` instead of `{label="value1" or ... or label="valueN"}`.


#### Arithmetic operations

MetricsQL supports all the basic arithmetic operations:

* addition - `+`
* subtraction - `-`
* multiplication - `*`
* division - `/`
* modulo - `%`
* power - `^`

This allows performing various calculations across multiple metrics.
For example, the following query calculates the percentage of error requests:

    (requests_error_total / (requests_error_total + requests_success_total)) * 100

#### Combining multiple series

Combining multiple time series with arithmetic operations requires an understanding of matching rules. Otherwise, the
query may break or may lead to incorrect results. The basics of the matching rules are simple:

* MetricsQL engine strips metric names from all the time series on the left and right side of the arithmetic operation
  without touching labels.
* For each time series on the left side MetricsQL engine searches for the corresponding time series on the right side
  with the same set of labels, applies the operation for each data point and returns the resulting time series with the
  same set of labels. If there are no matches, then the time series is dropped from the result.
* The matching rules may be augmented with `ignoring`, `on`, `group_left` and `group_right` modifiers.
  See [these docs](https://prometheus.io/docs/prometheus/latest/querying/operators/#vector-matching) for details.

#### Comparison operations

MetricsQL supports the following comparison operators:

* equal - `==`
* not equal - `!=`
* greater - `>`
* greater-or-equal - `>=`
* less - `<`
* less-or-equal - `<=`

These operators may be applied to arbitrary MetricsQL expressions as with arithmetic operators. The result of the
comparison operation is time series with only matching data points. For instance, the following query would return
series only for processes where memory usage exceeds `100MB`:

    process_resident_memory_bytes > 100*1024*1024

#### Aggregation and grouping functions

MetricsQL allows aggregating and grouping of time series. Time series are grouped by the given set of labels and then the
given aggregation function is applied individually per each group. For instance, the following query returns
summary memory usage for each `job`:

    sum(process_resident_memory_bytes) by (job)

See [docs for aggregate functions in MetricsQL](https://docs.victoriametrics.com/MetricsQL.html#aggregate-functions).

#### Calculating rates

One of the most widely used functions for [counters](#counter)
is [rate](https://docs.victoriametrics.com/MetricsQL.html#rate). It calculates the average per-second increase rate individually
per each matching time series. For example, the following query shows the average per-second data receive speed
per each monitored `node_exporter` instance, which exposes the `node_network_receive_bytes_total` metric:

    rate(node_network_receive_bytes_total)

By default, VictoriaMetrics calculates the `rate` over [raw samples](#raw-samples) on the lookbehind window specified in the `step` param
passed either to [instant query](#instant-query) or to [range query](#range-query).
The interval on which `rate` needs to be calculated can be specified explicitly
as [duration](https://prometheus.io/docs/prometheus/latest/querying/basics/#time-durations) in square brackets:

    rate(node_network_receive_bytes_total[5m])

In this case VictoriaMetrics uses the specified lookbehind window - `5m` (5 minutes) - for calculating the average per-second increase rate.
Bigger lookbehind windows usually lead to smoother graphs.

`rate` strips metric name while leaving all the labels for the inner time series. If you need to keep the metric name,
then add [keep_metric_names](https://docs.victoriametrics.com/MetricsQL.html#keep_metric_names) modifier
after the `rate(..)`. For example, the following query leaves metric names after calculating the `rate()`:

    rate(node_network_receive_bytes_total) keep_metric_names

`rate()` must be applied only to [counters](#counter). The result of applying the `rate()` to [gauge](#gauge) is undefined.
