FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++ vips-dev

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN apk del python3 make g++ vips-dev && rm -rf /app/node_modules

RUN npm install --only=production

EXPOSE 8080

CMD ["npm", "start"]
