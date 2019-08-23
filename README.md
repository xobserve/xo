# koala
- Website: http://koa.la
- Docs: https://docs.apm.ai/


Koala is a next-generation APM backend for @open-telemetry, written in go and rust.It's 100% open-source ,fully functional, and maybe one of the best full-stack APM solution for micro-service applications.

Koala is based on @open-telemetry, so it supports **tracing,metrics and logs** at the same place, and can deliver visualization, data correlation and smart analysis to you.

Koala also supports **pinpoint** format data, it's compatible with OpenTelemetry-format, so you can use pinpoint-agent to collect java data for powerful instrumenting.

Built in Go/Rust, Koala places high-value on performance, correctness, and  concurrency. It compiles to  several static binary and is very easy for deployment.

## Current Status
Working for <a href="https://github.com/apm-ai/koala/milestone/1">V0.1</a> and <a href="https://github.com/apm-ai/koala/milestone/1">V0.2</a> milestones.


## Features

* ***Fast*** - Built in Go/Rust, Koala is blistering fast and memory efficient.
* **OpenSource** - Koala is 100% open-source, no commercial-version in the future!
* **Full Visibility** - See every aspect of your applications and users in real-time
* **Traces,Metris &Logs** - Unifies traces, logs and metrics in the core system,based on @open-telemetry
* **Smart** - AI powered APM delivers the intelligent analysis and alert.
* **Multi Data Types Supported** - We support @open-telemetry and @pinpoint at the sametime
* **Beutiful UI** - Koala has beautiful admin UI and it's also very interactive

## Roadmap

* **V0.1-Server-side agent** - Collect opentelemetry data , send them to Koala-Collector
* **V0.2-Tracing Support** -  Collect,process and visualize tracing data.
* **V0.3-Tracing Metrics Support** - Extract general metrics from tracing data, such as url, sql, exception, method etc, visualize them in dashboard
* **V0.4-Alerting** - Build complex alerting logic using multiple trigger conditions, push alerts to multiple providers(sms, email etc)
* **V0.5-Dependency Analyzing** - Analyze the dependency data(server,url), output the server-map and url-map)
* **V0.6-Metrics Support** - Collect infrastructure and user-define metrics,correlate them with tracing data, output metrics to popular metrics storages
* **V0.7-Pinpoint supported** -1. Modified pinpoint-agent.jar to support OpenTelemery 2. Convert pinpoint-format to opentelemetry-format
* **V1.0-Production Ready** - Test in real production environment for at least 6 weeks, fix all critical bugs.
* **Future-Logs Support** - Collect logs in Koala-Agent(integrated with filebeat etc), correlate logs with tracing and metrcs, output logs to popular metrics storages, visualize and search them in Koala-Dashboard

We are now working at V0.1 and V0.2,it depends on the progress of OpenTelemetry's go sdk.

## License

Copyright 2019, Koala Authors. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not
use these files except in compliance with the License. You may obtain a copy
of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.

---

<p align="center">
  Developed with ❤️ by <strong><a href="https://apm.ai">APM Labs</a></strong>
</p>