FROM golang:1.21.4-alpine3.18 as builder

# set working directory
WORKDIR /app
RUN apk add build-base

ENV GOPROXY=https://goproxy.io,direct
COPY ./ ./
RUN CGO_ENABLED=1 go build -o hotrod



FROM xobserve/agent

# define arguments that can be passed during build time
ARG TARGETOS TARGETARCH

# add ca-certificates in case you need them
# RUN apk update && apk add ca-certificates && rm -rf /var/cache/apk/*

# set working directory
WORKDIR /app
COPY --from=builder /app/hotrod /app/hotrod
COPY ./start.sh /app/start.sh

RUN mv /app/xo-collector /app/xo-agent && chmod +x /app/start.sh

# run the binary
ENTRYPOINT ["/bin/sh", "/app/start.sh"]

