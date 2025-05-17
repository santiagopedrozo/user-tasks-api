# Target: Build
FROM node:20

WORKDIR /app

COPY . .

RUN npm install --only=development

RUN npm run build
