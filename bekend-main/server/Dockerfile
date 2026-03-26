FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY src ./src
RUN npm ci
EXPOSE 3001
CMD ["npm", "start"]
