FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci
COPY backend/ .
RUN npm run build

RUN apk del python3 make g++
RUN rm -rf /app/backend/node_modules

FROM node:20-alpine AS frontend-builder

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache nginx curl

RUN mkdir -p /var/www/html /app/data /app/logs

COPY --from=frontend-builder /app/dist /var/www/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /app/backend
COPY --from=builder /app/backend .
RUN npm install --only=production

RUN chown -R node:node /app

USER node

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD sh -c "nginx & exec node dist/index.js"
