FROM golang:1.21.4-alpine3.18 as builder

# set working directory
WORKDIR /app
RUN apk add build-base

ENV GOPROXY=https://goproxy.io,direct
COPY ./ ./
RUN CGO_ENABLED=1 go build -o query-service



FROM alpine:3.18

# Add Maintainer Info
LABEL maintainer="xobserve"

# define arguments that can be passed during build time
ARG TARGETOS TARGETARCH

# add ca-certificates in case you need them
# RUN apk update && apk add ca-certificates && rm -rf /var/cache/apk/*

# set working directory
WORKDIR /app/query-service
COPY --from=builder /app/query-service /app/query-service/query-service
COPY ./xobserve.yaml /etc/xobserve/xobserve.yaml

# Make query-service executable for non-root users
RUN chmod 755 /root /app/query-service/query-service

# run the binary
ENTRYPOINT ["./query-service"]

CMD ["--config", "/etc/xobserve/xobserve.yaml"]

EXPOSE 10086