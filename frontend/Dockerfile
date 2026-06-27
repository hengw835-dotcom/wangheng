FROM node:20-alpine AS build
WORKDIR /workspace
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL=
ARG VITE_BAIDU_MAP_AK=
ARG VITE_AMAP_KEY=
ARG VITE_OPENWEATHER_API_KEY=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_BAIDU_MAP_AK=$VITE_BAIDU_MAP_AK
ENV VITE_AMAP_KEY=$VITE_AMAP_KEY
ENV VITE_OPENWEATHER_API_KEY=$VITE_OPENWEATHER_API_KEY
RUN npm run build:linux

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/dist /usr/share/nginx/html
EXPOSE 80
