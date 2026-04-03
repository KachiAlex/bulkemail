FROM node:18-alpine

WORKDIR /app

# Copy only package.json so `npm install` uses the updated package.json
# (avoids a stale package-lock preventing new deps like webpack from installing)
COPY package.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]

