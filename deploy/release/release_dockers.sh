cd ../../datav
docker build -t xobserve/datav:latest .
docker push xobserve/datav:latest

cd ../otel-collector
docker build -t xobserve/otel-collector:latest .
docker push xobserve/otel-collector:latest
