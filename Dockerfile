ARG BASE_IMAGE=alpine:3.18.3
ARG JS_IMAGE=node:18-alpine3.18
ARG JS_PLATFORM=linux/amd64
ARG GO_IMAGE=golang:1.20-alpine


ARG GO_SRC=go-builder
ARG JS_SRC=js-builder

FROM --platform=${JS_PLATFORM} ${JS_IMAGE} as js-builder

ENV NODE_OPTIONS=--max_old_space_size=8000

WORKDIR /tmp/ui

COPY ./ui ./ 

RUN yarn config set registry https://registry.npmmirror.com/

RUN yarn install

RUN yarn run build

FROM ${GO_IMAGE} as go-builder

RUN if grep -i -q alpine /etc/issue; then \
  apk add --no-cache gcc g++ make; \
  fi

WORKDIR /tmp/query

COPY ./query .

ENV GOPROXY=https://proxy.golang.com.cn,direct \
  GO111MODULE=on


RUN CGO_ENABLED=1 GOOS=linux go build -o query-service

FROM ${BASE_IMAGE} as tgz-builder

WORKDIR /tmp/datav

FROM ${GO_SRC} as go-src
FROM ${JS_SRC} as js-src

# Final stage
FROM ${BASE_IMAGE}

COPY --from=go-src /tmp/query/query-service /root/query-service
COPY --from=js-src /tmp/ui/build /ui/

COPY ./query/datav.sql /root/datav.sql
COPY ./query/datav.yaml /root/datav.yml

EXPOSE 10086

ENTRYPOINT ["/root/query-service"]

CMD ["--config","/root/datav.yml"]