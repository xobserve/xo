if [ -z "$1" ]
then
    echo "Please provide the version number"
    exit 1
fi

cd ../../datav
docker build -t xobserve/datav:$1 .
docker push xobserve/datav:$1

cd ../otel-collector
docker build -t xobserve/collector:$1 -f DockerfileCollector .
docker push xobserve/collector:$1

docker build -t xobserve/agent:$1 -f DockerfileAgent .
docker push xobserve/agent:$1


cd ../examples/hotrod
docker build -t xobserve/hotrod:$1 .
docker push xobserve/hotrod:$1