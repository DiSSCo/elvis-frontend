FROM node:14.17.5 as build

COPY . /app
WORKDIR /app

RUN npm install && \
    NODE_ENV=production npm run build

FROM nginx:1.20.2-alpine

COPY nginx/default.conf /etc/nginx/conf.d/
COPY --from=build /app/dist/ /elvis