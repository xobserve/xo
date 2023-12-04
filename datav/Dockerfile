# build query service
FROM golang:1.21.4-alpine3.18 as queryBuilder

## set working directory
WORKDIR /app
RUN apk add build-base

ENV GOPROXY=https://goproxy.io,direct
COPY ./query/ ./
RUN CGO_ENABLED=1 go build -o query-service

# build ui
FROM node:16 AS uiBuilder
WORKDIR /app
COPY ./frontend/ ./
ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS=--max-old-space-size=16384

RUN yarn install
RUN yarn build

# start query service
FROM alpine:3.18

## Add Maintainer Info
LABEL maintainer="xobserve"

## define arguments that can be passed during build time
ARG TARGETOS TARGETARCH

# add ca-certificates in case you need them
# RUN apk update && apk add ca-certificates && rm -rf /var/cache/apk/*

# set working directory
WORKDIR /app/query-service

COPY --from=queryBuilder /app/query-service /app/query-service/query-service
COPY --from=uiBuilder /app/build /app/query-service/ui
COPY ./query/xobserve.yaml /etc/xobserve/xobserve.yaml

# Make query-service executable for non-root users
RUN chmod 755 /root /app/query-service/query-service

# run the binary
ENTRYPOINT ["./query-service"]

CMD ["--config", "/etc/xobserve/xobserve.yaml"]

EXPOSE 10086