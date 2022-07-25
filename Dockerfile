FROM node as build

COPY . /app
WORKDIR /app

RUN npm install && \
    NODE_ENV=production npm run build

FROM nginx

COPY nginx/default.conf /etc/nginx/conf.d/
COPY --from=build /app/dist/ /elvis