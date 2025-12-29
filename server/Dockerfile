# Build Stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=build /app/dist ./dist
# Prisma client might need regeneration or copy
COPY --from=build /app/prisma ./prisma
# Generate prisma client in prod
RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "start"]
