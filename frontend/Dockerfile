# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install packages targeting accurate node module resolution
COPY package.json package-lock.json* ./
RUN npm install --frozen-lockfile 2>/dev/null || npm install

# Copy source code and build
COPY . .
RUN npm run build

# Serve stage using lightweight Nginx container
FROM nginx:alpine

# Copy the built assets to default Nginx root directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 to web traffic
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
