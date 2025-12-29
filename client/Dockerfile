# Build Stage
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
# Install ALL dependencies (including devDependencies like typescript)
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Permissions (Just in case)
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
