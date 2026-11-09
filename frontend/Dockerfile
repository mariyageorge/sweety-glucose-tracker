# Stage 1: Build the Vite production bundle
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and configuration
COPY . .

# Build production static assets
RUN npm run build

# Stage 2: Serve with lightweight Nginx
FROM nginx:alpine AS runner

# Copy compiled assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx SPA reverse-proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

