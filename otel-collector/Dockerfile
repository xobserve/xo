FROM golang:1.21.4-alpine3.18 as builder

# set working directory
WORKDIR /app
ENV GOPROXY=https://goproxy.io,direct

COPY ./ ./
RUN go build -o collector



FROM alpine:3.18

# Add Maintainer Info
LABEL maintainer="xobserve"

# add ca-certificates in case you need them
# RUN apk update && apk add ca-certificates && rm -rf /var/cache/apk/*

# set working directory
WORKDIR /app
COPY --from=builder /app/collector /app/collector
COPY ./config/* /etc/collector/


# run the binary
ENTRYPOINT ["./collector"]

CMD ["--config", "/etc/collector/collector.yaml"]

EXPOSE 10086