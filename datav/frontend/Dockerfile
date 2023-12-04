FROM node:16 AS uibuilder
WORKDIR /frontend
COPY ./ ./
ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS=--max-old-space-size=16384
RUN yarn install
RUN yarn build

FROM nginx:1.25.2-alpine

# Add Maintainer Info
LABEL maintainer="xobserve"

# Set working directory
WORKDIR /frontend

# Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*

COPY --from=uibuilder /frontend/build/ /usr/share/nginx/html/

# Copy custom nginx config and static files
COPY nginx.template /etc/nginx/conf.d

EXPOSE 5173

WORKDIR /etc/nginx/conf.d

ENTRYPOINT envsubst '$QUERY_SERVICE_ADDR'  < nginx.template > default.conf && cat default.conf && nginx -g 'daemon off;'