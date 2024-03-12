# Deploy xobserve

## init xo all-in-one demo
```bash
docker-compose -p xobserve-demo -f ./docker-compose-all-in-one.yaml up -d
```

## init xo development environment
```bash
docker-compose -p xobserve-dev -f ./docker-compose-dev-deps.yaml up -d
```