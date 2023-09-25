ARG BASE_IMAGE=alpine:3.18.3
ARG JS_IMAGE=node:18-alpine3.18
ARG JS_PLATFORM=linux/amd64
ARG GO_IMAGE=golang:1.20-alpine


ARG GO_SRC=go-builder
ARG JS_SRC=js-builder

FROM --platform=${JS_PLATFORM} ${JS_IMAGE} as js-builder

ENV NODE_OPTIONS=--max_old_space_size=8000

WORKDIR /tmp/datav/ui

COPY ./ui ./ 

RUN yarn install

RUN yarn run build

FROM ${GO_IMAGE} as go-builder

RUN if grep -i -q alpine /etc/issue; then \
  apk add --no-cache gcc g++ make; \
  fi

WORKDIR /tmp/datav/backend

COPY ./backend .

ENV GOPROXY=https://proxy.golang.com.cn,direct \
  GO111MODULE=on

# RUN go mod download

RUN CGO_ENABLED=1 GOOS=linux go build -o /tmp/datav/bin

FROM ${BASE_IMAGE} as tgz-builder

WORKDIR /tmp/datav

FROM ${GO_SRC} as go-src
FROM ${JS_SRC} as js-src

# Final stage
FROM ${BASE_IMAGE}

COPY --from=go-src /tmp/datav/bin /tmp/datav/bin
COPY ./backend/datav.sql /tmp/datav/datav.sql
COPY ./backend/datav.yaml /tmp/datav/datav.yml
COPY --from=js-src /tmp/datav/ui/build /ui/

RUN ls /tmp/datav/

EXPOSE 10086

ENTRYPOINT ["/tmp/datav/bin","--config","/tmp/datav/datav.yml"]