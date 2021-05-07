# Fijarse, que se le agregó (AS build-env) a esta línea
FROM node:14.16.1-alpine AS build-env

RUN mkdir -p /app

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . /app


RUN npm run build:ssr

# FROM nginx:1.20.0-alpine AS copy

# COPY --from=build-env /app/dist/ /usr/share/nginx/html

# CMD ["nginx", "-g", "daemon off;"]
EXPOSE 80
CMD [ "node", "dist/server/main.js" ]
# RUN nohup node dist/server/main.js &
