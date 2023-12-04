FROM node:16 AS uibuilder
WORKDIR /frontend
COPY ./ ./
ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS=--max-old-space-size=16384
RUN yarn config set registry https://registry.npmmirror.com/ && yarn install
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
COPY frontend-nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173

ENTRYPOINT ["nginx", "-g", "daemon off;"]