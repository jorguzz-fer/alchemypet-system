# Build Stage
FROM node:18-slim as build
WORKDIR /app

# Install openssl for Prisma
RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./
# Install ALL deps for build
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM node:18-slim
WORKDIR /app

# Install openssl for Prisma in prod
RUN apt-get update -y && apt-get install -y openssl ca-certificates

COPY package*.json ./
# Install production deps
RUN npm install --production
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "start"]
