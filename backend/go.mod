module github.com/DataObserve/datav/backend

go 1.14

require (
	github.com/gin-contrib/gzip v0.0.5
	github.com/gin-contrib/static v0.0.1
	github.com/gin-gonic/gin v1.9.1
	github.com/go-sql-driver/mysql v1.7.0
	github.com/go-stack/stack v1.8.0
	github.com/golang/snappy v0.0.4
	github.com/gosimple/slug v1.9.0
	github.com/inconshreveable/log15 v0.0.0-20201112154412-8562bdadbbac
	github.com/k0kubun/colorstring v0.0.0-20150214042306-9440f1994b88 // indirect
	github.com/lithammer/shortuuid/v3 v3.0.5
	github.com/mattn/go-sqlite3 v1.14.17
	github.com/spf13/cobra v1.1.1
	github.com/teris-io/shortid v0.0.0-20220617161101-71ec9f2aa569
	go.nhat.io/otelsql v0.12.0
	go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin v0.44.0
	go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp v0.44.0
	go.opentelemetry.io/contrib/instrumentation/runtime v0.43.0
	go.opentelemetry.io/otel v1.18.0
	go.opentelemetry.io/otel/exporters/otlp/otlptrace v1.18.0
	go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp v1.18.0
	go.opentelemetry.io/otel/exporters/stdout/stdouttrace v1.17.0
	go.opentelemetry.io/otel/sdk v1.18.0
	go.opentelemetry.io/otel/sdk/metric v0.41.0
	go.opentelemetry.io/otel/trace v1.18.0
	go.uber.org/automaxprocs v1.5.3
	go.uber.org/zap v1.10.0
	golang.org/x/crypto v0.13.0
	gopkg.in/yaml.v2 v2.4.0
)
